import { ApiProperty } from "@nestjs/swagger";

export class OTPRefDto {

  @ApiProperty({ description: 'รหัสอ้างอิงของรหัสผ่านใช้ครั้งเดียว', default: 'AXDE' })
  ref: string;
}