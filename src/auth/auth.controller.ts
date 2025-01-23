import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiExtraModels,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  OmitType,
} from '@nestjs/swagger';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/request/login.dto';
import { TokenDto } from './dto/response/token.dto';
import { LocalAuthenticationGuard } from './guard/local-auth.guard';
import JwtAuthenticationGuard from './guard/jwt-auth.guard';
import { RefreshDto } from './dto/request/refresh.dto';
import { ForgotPasswordDto } from './dto/request/forgot-password.dto';
import { OTPRefDto } from './dto/response/otp-ref.dto';
import { OTPDto } from './dto/request/otp.dto';
import { UpdatePasswordDto } from './dto/request/update-password.dto';
import JwtRefreshGuard from './guard/jwt-refesh.guard';
import {
  ApiBadRequestResponseGeneric,
  ApiNotFoundResponseGeneric,
  ApiOkResponseGeneric,
  BaseResponseDto,
  responseSuccess,
} from 'src/_utils/decorators/api-response.decorator';
import { AuthUser } from 'src/_utils/decorators/auth-user.decorator';
import { Response, Request } from 'express';
import { RequestLogGuard } from './guard/request-log.guard';
import { User } from 'src/_entity/user.entity';

@ApiTags('Auth')
@Controller('auth')
@ApiExtraModels(BaseResponseDto)
@ApiBadRequestResponseGeneric({
  description: getReasonPhrase(StatusCodes.BAD_REQUEST),
  type: BaseResponseDto,
})
@ApiNotFoundResponseGeneric({
  description: getReasonPhrase(StatusCodes.NOT_FOUND),
  type: BaseResponseDto,
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    // private readonly loginLogService: LoginLogService
  ) {}

  @ApiOperation({
    description: 'ลงชื่อเข้าใช้งานระบบ',
    summary: 'user, authlog',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponseGeneric({
    description: getReasonPhrase(StatusCodes.OK),
    type: TokenDto,
  })
  @UseGuards(LocalAuthenticationGuard)
  @Post('login')
  async logIn(@AuthUser() user: User, @Res() res: Response) {
    const tokens = await this.authService.getJwtTokens(user);
    // if (tokens) {
    //     data_log.id_user = user.id_user
    //     data_log.action = ActionType.LOGIN
    //     await this.loginLogService.createLog(data_log)
    // }
    return res.status(StatusCodes.OK).send(responseSuccess(tokens));
  }

  //   @ApiOperation({
  //     description: 'ใช้ refresh token เพื่อขอ access token ใหม่',
  //     summary: 'user, authlog',
  //   })
  //   @ApiBody({ type: RefreshDto })
  //   @ApiOkResponseGeneric({
  //     description: getReasonPhrase(StatusCodes.OK),
  //     type: TokenDto,
  //   })
  //   @UseGuards(JwtRefreshGuard, RequestLogGuard)
  //   @ApiBearerAuth('access-token')
  //   @Post('refresh')
  //   async refresh(
  //     @AuthUser() user: User,
  //     @Res() res: Response,
  //     @Body() body: RefreshDto,
  //   ) {
  //     const tokens = await this.authService.tryRefreshTokens(
  //       body.refreshToken,
  //       user,
  //     );

  //     return res.status(StatusCodes.OK).send(responseSuccess(tokens));
  //   }

  @ApiOperation({ description: 'ออกจากระบบ', summary: 'user, authlog' })
  @ApiOkResponseGeneric({
    description: getReasonPhrase(StatusCodes.OK),
    type: Boolean,
  })
  @UseGuards(JwtAuthenticationGuard, RequestLogGuard)
  @ApiBearerAuth('access-token')
  @Get('logout')
  async logout(
    @AuthUser() user: User,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const accessToken = req.headers.authorization.slice('Bearer '.length);
    const resLogout = await this.authService.logout(accessToken, user);
    // if (resLogout) {
    //   data_log.id_user = user.id_user;
    //   data_log.action = ActionType.LOGOUT;
    //   await this.loginLogService.createLog(data_log);
    // }
    return res.status(StatusCodes.OK).send(responseSuccess(resLogout));
  }

  @ApiOperation({
    description: 'ขอดูข้อมูลพนักงานของตนเอง',
    summary: 'user, department, position',
  })
  @ApiOkResponseGeneric({
    description: getReasonPhrase(StatusCodes.OK),
    type: User,
  })
  @UseGuards(JwtAuthenticationGuard, RequestLogGuard)
  @ApiBearerAuth('access-token')
  @Get('profile')
  async getProfile(@AuthUser() user: User, @Res() res: Response) {
    const resProfile = await this.authService.getUserProfile(user);

    return res.status(StatusCodes.OK).send(responseSuccess(resProfile));
  }

  @ApiOperation({
    description: 'ลืมรหัสผ่าน, ระบบส่ง OTP เพื่อยืนยันตัวตน',
    summary: 'user',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponseGeneric({
    description: getReasonPhrase(StatusCodes.OK),
    type: OTPRefDto,
  })
  @UseGuards(RequestLogGuard)
  @Post('forgotpassword')
  async forgotPassword(@Res() res: Response, @Body() body: ForgotPasswordDto) {
    const otp = await this.authService.forgotPassword(body.email);

    return res.status(StatusCodes.OK).send(responseSuccess(otp));
  }

  //   @ApiOperation({ description: 'ตรวจสอบรหัส OTP', summary: 'user' })
  //   @ApiBody({ type: OTPDto })
  //   @ApiOkResponseGeneric({
  //     description: getReasonPhrase(StatusCodes.OK),
  //     type: TokenDto,
  //   })
  //   @UseGuards(RequestLogGuard)
  //   @Post('validate-otp')
  //   async validateOtp(@Res() res: Response, @Body() body: OTPDto) {
  //     const tokens = await this.authService.validateOtp(
  //       body.email,
  //       body.otp,
  //       body.ref,
  //     );

  //     return res.status(StatusCodes.OK).send(responseSuccess(tokens));
  //   }

  @ApiOperation({ description: 'ตั้งรหัสผ่านใหม่', summary: 'user' })
  @ApiBody({ type: UpdatePasswordDto })
  @ApiOkResponseGeneric({
    description: getReasonPhrase(StatusCodes.OK),
    type: Boolean,
  })
  @UseGuards(JwtAuthenticationGuard, RequestLogGuard)
  @ApiBearerAuth('access-token')
  @Patch('password')
  async updatePassword(
    @AuthUser() user: User,
    @Res() res: Response,
    @Body() body: UpdatePasswordDto,
  ) {
    const resUpdatePassword = await this.authService.updatePassword(
      user,
      body.password,
    );

    return res.status(StatusCodes.OK).send(responseSuccess(resUpdatePassword));
  }
}
