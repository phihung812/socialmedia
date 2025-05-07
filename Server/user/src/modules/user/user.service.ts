import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt'; // Đảm bảo import này

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  async getAll(): Promise<any> {
    const users = await this.UserModel.find().exec();
    return users;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    // Kiểm tra username và email đã tồn tại chưa
    const existingUser = await this.UserModel
      .findOne({
        $or: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      })
      .exec();
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
      statistics: { postCount: 0, followerCount: 0, followingCount: 0 },
      accountStatus: 'active',
    });

    return newUser.save();
  }
}
