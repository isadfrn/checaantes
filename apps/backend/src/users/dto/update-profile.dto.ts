import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 120, { message: 'Informe seu nome completo' })
  name?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @Matches(/^\d{10,11}$/, {
    message: 'Informe um telefone válido com DDD (10 ou 11 dígitos)',
  })
  phone?: string;
}
