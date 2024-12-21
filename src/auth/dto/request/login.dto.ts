import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: 'อีเมล', default: 'abcde@test.com' })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ description: 'รหัสผ่าน', default: '1234' })
  password: string;
}