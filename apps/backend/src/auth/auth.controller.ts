import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ConfirmEmailDto } from './dto/confirm-email.dto.js';
import { ResendConfirmationDto } from './dto/resend-confirmation.dto.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Cadastra um usuário (envia e-mail de confirmação; não retorna token)',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Autentica e retorna um accessToken (JWT)' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('confirm')
  @ApiOperation({
    summary: 'Confirma o e-mail (link enviado no e-mail) via token',
  })
  confirm(@Query() dto: ConfirmEmailDto) {
    return this.authService.confirmEmail(dto.token);
  }

  @Post('resend-confirmation')
  @ApiOperation({ summary: 'Reenvia o e-mail de confirmação' })
  resendConfirmation(@Body() dto: ResendConfirmationDto) {
    return this.authService.resendConfirmation(dto.email);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Envia um código de 6 dígitos para redefinir a senha' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Redefine a senha usando o código recebido por e-mail' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
