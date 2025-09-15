import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as jwt from 'jsonwebtoken';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schema/refresh_token.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
  ) {}

  async insertToken(refreshToken: string) {
    const payload = await this.verifyToken(refreshToken);
    const hashedToken = await bcrypt.hash(refreshToken, 10);

    const newToken = new this.refreshTokenModel({
      userId: payload.sub,
      token: hashedToken,
      expires_at: payload.exp,
      revoked: false,
      jti: payload.jti,
    });
    newToken.save();
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
      return decoded;
    } catch (error) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }
  }

  async getToken(refreshToken: string) {
    
    const payload = await this.verifyToken(refreshToken);

    const tokenDoc = await this.refreshTokenModel
      .findOne({ jti: payload.jti, revoked: false })
      .exec();


    if (!tokenDoc) return null;

    const now = Date.now();
    const expiresAt = Number(tokenDoc.expires_at) * 1000;

    if (expiresAt < now) {
        
      await this.refreshTokenModel.updateOne(
        { _id: tokenDoc._id },
        { $set: { revoked: true } },
      );
      return null;
    }

    const isMatch = await bcrypt.compare(refreshToken, tokenDoc.token);

    return isMatch ? tokenDoc : null;
  }

  async revokeToken(refreshToken: string) {
    const payload = await this.verifyToken(refreshToken);

    const tokenDoc = await this.refreshTokenModel
      .findOne({ jti: payload.jti, revoked: false })
      .exec();

    if (!tokenDoc) {
      throw new UnauthorizedException('token không hợp lệ');
    }

    await this.refreshTokenModel.updateOne(
      { _id: tokenDoc._id },
      { $set: { revoked: true } },
    );

    return true;
  }
}
