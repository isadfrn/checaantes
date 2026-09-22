import {
  IsEmail,
  IsIn,
  IsString,
  IsUUID,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { BRAZILIAN_STATES } from '../constants/brazilian-states.js';
import { Match } from '../../common/validators/match.decorator.js';

export class RegisterDto {
  @IsString()
  @Length(2, 120, { message: 'Informe seu nome completo' })
  name: string;

  @IsEmail({}, { message: 'Informe um e-mail válido' })
  email: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @Matches(/^\d{10,11}$/, {
    message: 'Informe um telefone válido com DDD (10 ou 11 dígitos)',
  })
  phone: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsIn(BRAZILIAN_STATES, { message: 'Informe uma UF válida (ex.: SC)' })
  state: string;

  @IsUUID('4', { message: 'Selecione uma profissão válida' })
  professionId: string;

  @IsString()
  @MinLength(8, { message: 'A senha precisa ter no mínimo 8 caracteres' })
  password: string;

  @IsString()
  @Match('password', { message: 'As senhas não conferem' })
  passwordConfirmation: string;
}
