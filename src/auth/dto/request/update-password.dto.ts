import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdatePasswordDto {

  @IsNotEmpty()
  @ApiProperty({ description: 'รหัสผ่าน', default: 'P@ssw0rd' })
  password: string;
}