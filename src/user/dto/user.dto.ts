import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserDto {
  @ApiProperty({ description: 'ชื่อผู้ใช้', example: 'tonkow' })
  user_name: string;

  @ApiProperty({ description: 'mail', example: 'sonsit.pungpai@gmail.com' })
  user_email: string;

  @ApiProperty({ description: 'password', example: 'asd' })
  password: string;

  @ApiHideProperty()
  status: string;

  @ApiHideProperty()
  created_date: Date;

  @ApiHideProperty()
  modified_date: Date;

  @ApiHideProperty()
  id_file: number;
}
