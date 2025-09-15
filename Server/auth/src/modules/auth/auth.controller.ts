import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { Request } from 'express'; // Import từ express
import { RefreshTokenService } from '../refresh_token/refresh_token.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private refreshTokenService: RefreshTokenService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);

    if (!user) {
      throw new UnauthorizedException('Thông tin không chính xác');
    }
    const { access_token, refresh_token } = await this.authService.login(user);

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true, // JS không đọc được (an toàn trước XSS)
      secure: false, // chỉ gửi qua HTTPS (bật khi production)
      sameSite: 'strict', // chống CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    return {
      access_token,
      user,
    };
  }

  @Post('refresh')
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Không nhận được refresh token');
    }

    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {    

    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('Không nhận được refresh token');
    }

    await this.refreshTokenService.revokeToken(refreshToken);

    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: new Date(0), // cookie hết hạn ngay
    });

    return "Logout thành công"
  }
}
