import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './schema/post.schema';
import mongoose, { Model } from 'mongoose';
import { CreatePostDto } from './dto/create-post.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PostPublisherService } from './post-publisher.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    @Inject('FOLLOW_SERVICE') private readonly followClient: ClientProxy,
    @Inject('INTERACTION_SERVICE')
    private readonly interactionClient: ClientProxy,
    private readonly postPublisher: PostPublisherService,
    private readonly redisClient: RedisService,
  ) {}

  async getAll(): Promise<any> {
    const posts = await this.PostModel.find().exec();
    return posts;
  }

  async getPostToProfileMe(userId: string): Promise<any> {
    let posts;
    const cacheKey = `posts-by-user:${userId}`;
    const cachedPosts = await this.redisClient.get(cacheKey);

    if (cachedPosts) {
      posts = JSON.parse(cachedPosts);
      
    } else {
      posts = await this.PostModel.find({ userId: userId }).sort({
        createdAt: -1,
      });
      await this.redisClient.set(cacheKey, JSON.stringify(posts), 300);      
    }
    
    return posts;
  }

  async getUserWithCache(userId: string) {    
    const cacheKey = `user:${userId}`;
    const cachedUser = await this.redisClient.get(cacheKey);    

    if (cachedUser) {      
      return JSON.parse(cachedUser);
    }
    const resUser = await firstValueFrom(
      this.userClient.send({ cmd: 'user-info' }, userId ),
    );    
    await this.redisClient.set(cacheKey, JSON.stringify(resUser), 1800);

    return resUser;
  }

  async getPostBysUserId(userId: string, currentUserId: string): Promise<any> {
    let posts;
    const cacheKey = `posts-by-user:${userId}`;
    const cachedPosts = await this.redisClient.get(cacheKey);

    if (cachedPosts) {      
      posts = JSON.parse(cachedPosts);
      
    } else {

      posts = await this.PostModel.find({ userId: userId }).sort({
        createdAt: -1,
      }).lean();
      await this.redisClient.set(cacheKey, JSON.stringify(posts), 180);      
    }

    const postIds = posts.map((p) => p._id);

    const likedPostIds = await firstValueFrom(
      this.interactionClient.send(
        { cmd: 'list-like-post' },
        { currentUserId, postIds },
      ),
    );

    const resAuthor = await this.getUserWithCache(userId);

    const author = {
      username: resAuthor.username,
      fullName: resAuthor.fullName,
      avatar: resAuthor.avatar.avatar_url,
    };

    const formattedPosts = posts.map((post: any) => {
      const plainPost = post;
      return {
        ...plainPost,
        liked: likedPostIds.includes(post._id.toString()),
        author,
      };
    });

    return formattedPosts;
  }

  async createPost(createPostDto: CreatePostDto) {
    const created = new this.PostModel(createPostDto);
    const post = await created.save();
    const postId = post._id;
    const authorId = post.userId;
    const username = post.author.username;

    // await firstValueFrom(
    //   this.userClient.emit({ cmd: 'update-count-post' }, post.author.userId),
    // );

    await Promise.all([
      firstValueFrom(
        this.userClient.emit({ cmd: 'update-count-post' }, post.author.userId),
      ),
      firstValueFrom(this.followClient.emit('create-post', authorId)),
    ]);


    await this.postPublisher.publishPostCreated(post);
    console.log('đã gửi đến search');

    await this.redisClient.set(`post:${postId}`, JSON.stringify(post), 180);

    await this.redisClient.del(
      `posts-by-user:${authorId}`,
      `user-username:${username}`,
    );    

    return post;
  }

  async deletePost(postId: string, currentUserId: string, username: string) {
    const post = await this.PostModel.findById(postId);
    const authorId = post?.userId;
    if (!post) {
      throw new NotFoundException('Không tìm thấy bài viết');
    }
    if (post.userId.toString() !== currentUserId) {
      throw new ForbiddenException('Bạn không phải là chủ bài viết');
    }
    const deletedPost = await this.PostModel.findByIdAndDelete(postId);

    await firstValueFrom(
      this.userClient.emit({ cmd: 'update-count-post-delete' }, post.author.userId),
    );

    await this.redisClient.del(
      `posts-by-user:${authorId}`,
      `user-username:${username}`,
      `post:${postId}`,
    );

    return {
      message: 'Xóa bài viết thành công',
      deletedPost,
    };
  }

  async updateCountLikePost(postId: string, count: number) {
    const post = await this.PostModel.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const likeCount = Math.max(0, (post.statistics.likeCount || 0) + count);

    const result = await this.PostModel.findByIdAndUpdate(
      postId,
      { 'statistics.likeCount': likeCount },
      { new: true },
    );

    await this.postPublisher.publishPostUpdated(result);
    return result;
  }

  async updateCommentCountPost(postId: string, count: number) {
    const post = await this.PostModel.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    const commentCount = Math.max(
      0,
      (post.statistics.commentCount || 0) + count,
    );

    const result = await this.PostModel.findByIdAndUpdate(
      postId,
      { 'statistics.commentCount': commentCount },
      { new: true },
    );

    await this.postPublisher.publishPostUpdated(result);
    return result;
  }

  async getPostById(postId: string, currentUserId: string) { 

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new NotFoundException('ID bài post không hợp lệ');
    }

    let post;
    const cacheKey = `post:${postId}`;
    const cachedPost = await this.redisClient.get(cacheKey);
    if (cachedPost) {
      post = JSON.parse(cachedPost);
    } else {     
       
      post = await this.PostModel.findById(postId).lean();
      if(!post) {
        throw new NotFoundException('Không tìm thấy bài viết')
      }
      await this.redisClient.set(cacheKey, JSON.stringify(post), 150);
    }

    const followerId = post?.userId;

    const liked = await firstValueFrom(
      this.interactionClient.send(
        { cmd: 'check-isLiked' },
        { currentUserId, postId },
      ),
    );    

    const saved = await firstValueFrom(
      this.interactionClient.send(
        { cmd: 'check-isSaved' },
        { currentUserId, postId },
      ),
    );

    const followingId = currentUserId;
    const followed = await firstValueFrom(
      this.followClient.send(
        { cmd: 'check-follow-status' },
        { followerId, followingId },
      ),
    );

    const resAuthor = await this.getUserWithCache(followerId!.toString());    

    const author = {
      username: resAuthor.username,
      fullName: resAuthor.fullName,
      avatar: resAuthor.avatar.avatar_url,
    };

    return {
      ...post,
      author,
      liked: liked,
      saved: saved,
      followed: followed.isFollowed,
    };
  }

  async getInfoPost(postId: string) {
    let post;
    const cachKey = `post:${postId}`;
    const cached = await this.redisClient.get(cachKey);
    if (cached) {
      post = JSON.parse(cached);
    } else {
      post = await this.PostModel.findById(postId).lean();
      await this.redisClient.set(cachKey, JSON.stringify(post), 150);
    }
    
    return post;
  }
}
