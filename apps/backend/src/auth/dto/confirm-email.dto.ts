import { IsString, IsNotEmpty } from 'class-validator';

export class ConfirmEmailDto {
  @IsString()
  @IsNotEmpty({ message: 'Token de confirmação é obrigatório' })
  token: string;
}
