import { ApiProperty } from "@nestjs/swagger";

export class TokenDto {

  @ApiProperty({ description: 'บังคับให้เปลี่ยนรหัสผ่าน', default: false })
  require_change_password: boolean;
    
  @ApiProperty({ description: 'token สำหรับเรียกใช้งาน api ต่างๆ', default: 'abcde' })
  access_token: string;

  @ApiProperty({ description: 'token สำหรับใช้ขอ access token ใหม่', default: 'abcde' })
  refresh_token: string;

  @ApiProperty({ description: 'เวลาที่สร้าง token', default: '2023-01-01' })
  issue_date: string;

  @ApiProperty({ description: 'เวลาที่ access token หมดอายุ', default: '2033-01-01' })
  expire_date: string;
}