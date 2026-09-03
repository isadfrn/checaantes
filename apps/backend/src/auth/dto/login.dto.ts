import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password: string;
}
