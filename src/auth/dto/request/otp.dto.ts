import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEmail, Length } from "class-validator";

export class OTPDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: 'อีเมล', default: 'abcde@test.com' })
  email: string;
    
  @IsNotEmpty()
  @Length(6, 6)
  @ApiProperty({ description: 'รหัสผ่านใช้ครั้งเดียว', default: '789321' })
  otp: string;

  @IsNotEmpty()
  @Length(4, 4)
  @ApiProperty({ description: 'รหัสอ้างอิงของรหัสผ่านใช้ครั้งเดียว', default: 'AXDE' })
  ref: string;
}