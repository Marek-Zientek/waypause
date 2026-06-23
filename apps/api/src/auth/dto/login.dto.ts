import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Podaj prawidłowy adres email' })
  email!: string;

  @IsString()
  password!: string;
}
