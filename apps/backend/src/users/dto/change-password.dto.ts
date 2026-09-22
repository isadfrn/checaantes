import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Match } from '../../common/validators/match.decorator.js';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Informe a senha atual' })
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'A senha precisa ter no mínimo 8 caracteres' })
  password: string;

  @IsString()
  @Match('password', { message: 'As senhas não conferem' })
  passwordConfirmation: string;
}
