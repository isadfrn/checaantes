import { IsEmail, IsString, Length, MinLength } from 'class-validator';
import { Match } from '../../common/validators/match.decorator.js';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;

  @IsString()
  @Length(6, 6, { message: 'O código de acesso tem 6 dígitos' })
  code: string;

  @IsString()
  @MinLength(8, { message: 'A senha precisa ter no mínimo 8 caracteres' })
  password: string;

  @IsString()
  @Match('password', { message: 'As senhas não conferem' })
  passwordConfirmation: string;
}
