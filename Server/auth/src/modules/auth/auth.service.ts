import { ConfigService } from '@nestjs/config';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { firstValueFrom } from 'rxjs';
import { RefreshTokenService } from '../refresh_token/refresh_token.service';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    private configService: ConfigService,
    private readonly refreshTokenService : RefreshTokenService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await firstValueFrom(
      this.userClient.send({ cmd: 'get-user-by-id' }, email),
    );

    if (!user) {
      throw new UnauthorizedException('Tài khoản không tồn tại');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (isPasswordMatch) {
      const plainUser = user;

      // Trả về đối tượng đã loại bỏ password
      const { password, ...result } = plainUser;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const jti = uuidv4();

    const payload = {
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar.avatar_url,
      sub: user._id,
      role: user.role,
      jti,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
      header: {
        kid: 'kid',
        alg: 'HS256',
      },
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      header: {
        kid: 'kid',
        alg: 'HS256',
      },
    });

    await this.refreshTokenService.insertToken(refreshToken);    

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshAccessToken(refreshToken: string) {    
    try {
      const isToken = await this.refreshTokenService.getToken(refreshToken);      

      if(!isToken){        
        throw new UnauthorizedException(
          'Refresh token không hợp lệ hoặc đã hết hạn ',
        );
      }
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const newAccessToken = this.jwtService.sign(
        {
          email: payload.email,
          username: payload.username,
          fullName: payload.fullName,
          avatar: payload.avatar,
          sub: payload.sub,
          role: payload.role,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '15m',
          header: { kid: 'kid', alg: 'HS256' }, 
        },
      );

      return { access_token: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException(
        'Refresh token không hợp lệ hoặc đã hết hạn ',
      );
    }
  }
}
