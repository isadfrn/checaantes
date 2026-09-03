import { IsEmail, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;
  @MinLength(8, { message: 'A senha precisa ter no mínimo 8 caracteres' })
  password: string;
}
