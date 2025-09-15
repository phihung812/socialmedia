import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt'; 
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPublisherService } from './user-publisher.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    private readonly userPublisher: UserPublisherService,
    @Inject('FOLLOW_SERVICE') private readonly followClient: ClientProxy,
    @Inject('MESSAGE_SERVICE') private readonly messageClient: ClientProxy,
    @Inject('FEED_SERVICE') private readonly feedClient: ClientProxy,

    private readonly redisClient: RedisService,
  ) {}

  async getAll(): Promise<any> {
    const users = await this.UserModel.find().exec();
    return users;
  }

  async findById(id: string): Promise<any> {
    let user;
    const cacheKey = `user:${id}`;
    const cached = await this.redisClient.get(cacheKey);

    if (cached) {
      user = JSON.parse(cached);
    } else {
      user = await this.UserModel.findById(id)
        .select('fullName username avatar email role bio statistics ')
        .lean()
        .exec();
      await this.redisClient.set(cacheKey, JSON.stringify(user), 1800);
    }
    if (!user) throw new NotFoundException('Không tin thấy người dùng');
    return user;
  }

  async userInfoById(id: string): Promise<any> {
    let user;
    const cacheKey = `user:${id}`;
    const cached = await this.redisClient.get(cacheKey);

    if (cached) {
      user = JSON.parse(cached);
    } else {
      user = await this.UserModel.findById(id)
        .select('fullName username avatar email role')
        .lean()
        .exec();
      await this.redisClient.set(cacheKey, JSON.stringify(user), 1800);
    }
    if (!user) throw new NotFoundException('Không tin thấy người dùng');
    return user;
  }

  async findByUsername(username: string, followingId: string): Promise<any> {
    let user;
    const cacheKey = `user-username:${username}`;
    const cached = await this.redisClient.get(cacheKey);

    if (cached) {
      user = JSON.parse(cached);
    } else {
      const userDoc = await this.UserModel.findOne({ username: username })
        .lean()
        .exec();
      if (userDoc) {
        user = {
          ...userDoc,
          _id: userDoc._id.toString(),
        };
        await this.redisClient.set(cacheKey, JSON.stringify(user), 1500);
      }
    }

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    const followerId = user._id;

    let followStatus = null;
    try {
      followStatus = await firstValueFrom(
        this.followClient.send(
          { cmd: 'check-follow-status' },
          { followerId, followingId },
        ),
      );
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái follow:', error);
    }

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      followStatus,
    };
  }

  async findUser(email: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ email }).exec();
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.UserModel.findOne({
      $or: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    }).exec();
    if (existingUser) {
      throw new ConflictException('Username or email đã tồn tại');
    }

    // Mã hóa mật khẩu
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    // Tạo user mới
    const newUser = new this.UserModel({
      ...createUserDto,
      password: hashedPassword,
      isVerified: false,
      isPrivate: false,
      statistics: { postCount: 0, followerCount: 0, followingCount: 0 },
      accountStatus: 'active',
    });

    const user = await newUser.save();

    await this.userPublisher.publishUserCreated(user);

    console.log('Đã gửi mess đến user-create');
    await this.feedClient.emit('user-create', user._id);

    return user;
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }
    const oldUsername = user.username;

    if (updateUserDto.username || updateUserDto.email) {
      const existingUser = await this.UserModel.findOne({
        $or: [
          { username: updateUserDto.username },
          { email: updateUserDto.email },
        ],
        _id: { $ne: userId },
      }).exec();

      if (existingUser) {
        throw new ConflictException('Username hoặc email đã tồn tại');
      }
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await user.save();

    const newUsername = updateUserDto.username;
    console.log(oldUsername, newUsername);

    if (newUsername && newUsername !== oldUsername) {
      await this.messageClient.emit('user-name-update', {
        oldUsername,
        newUsername,
      });
      console.log('đã gửi sang message');
    }

    await this.redisClient.del(`user:${userId}`);

    await this.userPublisher.publishUserUpdated(user);

    return user.save();
  }

  async updateCountPost(userId: string, count: number) {
    const user = await this.UserModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.statistics.postCount = (user.statistics.postCount || 0) + count;
    await user.save();

    return user;
  }

  async updateFollow(data: any) {
    const followerId = data.followerId;

    const user = await this.UserModel.findById(followerId);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.statistics.followerCount = (user.statistics.followerCount || 0) + 1;

    const newUser = user.save();
    await this.userPublisher.publishUserUpdated(user);
    await this.redisClient.del(`user-username:${user.username}`);

    return newUser;
  }

  async updateUnFollow(data: any) {
    const followerId = data.followerId;

    const user = await this.UserModel.findById(followerId);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.statistics.followerCount = (user.statistics.followerCount || 0) - 1;

    const newUser = user.save();
    await this.userPublisher.publishUserUpdated(user);

    await this.redisClient.del(`user-username:${user.username}`);

    return newUser;
  }

  async updateAvatar(userId: string, avatar: Object): Promise<User> {
    const user = await this.UserModel.findByIdAndUpdate(
      userId,
      { $set: avatar },
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new NotFoundException('User không tồn tại');
    }

    await this.redisClient.del(`user:${userId}`);
    await this.userPublisher.publishUserUpdated(user);
    return user;
  }

  async handleGetUserInforToComment(userIds: string[]) {
    const objectIds = userIds.map((id) => new Types.ObjectId(id));

    const users = await this.UserModel.find({ _id: { $in: objectIds } })
      .select('username fullName avatar')
      .lean();

    return users;
  }

  async getListInforUser(userIds: string[]) {
    return this.UserModel.find({ _id: { $in: userIds } })
      .select('_id fullName username avatar')
      .lean();
  }
}
