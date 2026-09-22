import { IsEmail } from 'class-validator';

export class ResendConfirmationDto {
  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;
}
