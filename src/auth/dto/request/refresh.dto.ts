import { ApiProperty } from "@nestjs/swagger";
import { IsJWT, IsNotEmpty } from "class-validator";

export class RefreshDto {
  @IsNotEmpty()
  @IsJWT()
  @ApiProperty({ description: 'token สำหรับใช้ขอ access token ใหม่', default: 'abcde' })
  refreshToken: string;
}