import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadFileDto, UserDto } from './dto/user.dto';
import { AuthUser } from 'src/_utils/decorators/auth-user.decorator';
import { User } from 'src/_entity/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import JwtAuthenticationGuard from 'src/auth/guard/jwt-auth.guard';
import { responseSuccess } from 'src/_utils/decorators/api-response.decorator';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id_user/find-one')
  async findOne(@Param('id_user') id_user: number) {
    return await this.userService.findOne(id_user);
  }

  @Post()
  async created(@Body() body: UserDto) {
    return await this.userService.create(body);
  }

  @Patch(':id_user')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth('access-token')
  async updated(
    @Param('id_user') id_user: number,
    @Body() body: UserDto,
    @AuthUser() user: User,
  ) {
    return await this.userService.update(id_user, body, user);
  }

  @Post('upload/profile')
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth('access-token')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ type: UploadFileDto })
  async uploadProfile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType:
              /^(image\/(png|jpg|jpeg)|application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)|text\/csv)$/,
          }),
        ],
        exceptionFactory: () =>
          new BadRequestException(
            'Invalid file type. Allowed types are pdf, doc, docx, xls, xlsx, png, jpg, jpeg, csv.',
          ),
      }),
    )
    file: Express.Multer.File,
    @AuthUser() user: User,
  ) {
    return await this.userService.uploadFile(file, user?.id_user);
  }

  @Delete()
  @UseGuards(JwtAuthenticationGuard)
  @ApiBearerAuth('access-token')
  async remove(@AuthUser() user: User) {
    return await this.userService.remove(user?.id_user);
  }
}
