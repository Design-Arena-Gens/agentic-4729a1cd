import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from 'class-validator';
import { UserRole } from '@prisma/client';

class RegisterDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsPhoneNumber('IN') phone!: string;
  @IsString() password!: string;
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
}

class LoginDto {
  @IsString() emailOrPhone!: string;
  @IsString() password!: string;
}

class OtpDto {
  @IsPhoneNumber('IN') phone!: string;
}

class RefreshDto {
  @IsString() userId!: string;
  @IsString() refreshToken!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.loginWithPassword(dto.emailOrPhone, dto.password);
  }

  @Post('otp')
  otp(@Body() dto: OtpDto) {
    return this.auth.sendOtp(dto.phone);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.userId, dto.refreshToken);
  }

  @Post('logout')
  logout(@Body() dto: RefreshDto) {
    return this.auth.logout(dto.userId, dto.refreshToken);
  }
}
