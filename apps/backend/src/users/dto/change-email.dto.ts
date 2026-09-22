import { IsEmail } from 'class-validator';

export class ChangeEmailDto {
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;
}
