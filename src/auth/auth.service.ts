import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DataSource, MoreThanOrEqual } from 'typeorm';
import { LoginDto } from './dto/request/login.dto';
import { DateTime } from 'luxon';
import { TokenDto } from './dto/response/token.dto';
import { OTPRefDto } from './dto/response/otp-ref.dto';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import * as RandExp from 'randexp';
import { User } from 'src/_entity/user.entity';
import { AuthLog } from 'src/_entity/auth-log.entity';
import { CommonStatus } from 'src/_enum/common.status';
import { ErrorMessage } from 'src/_enum/error-message';
// import { MailService } from 'src/mail/mail.service';
// import { PermissionService } from 'src/permission/permission.service';
// import { AuthLog } from 'src/_entities/auth-log.entity';
// import { OTPLog } from 'src/_entities/otp-log.entity';
// import { User } from 'src/_entities/user.entity';
// import { Common } from 'src/_constants/enum';
// import { ErrorMessage } from 'src/_constants/error-message';
// import { Employee } from 'src/_entities/employee.entity';
// import { Student } from 'src/_entities/student.entity';
// import { Advisor } from 'src/_entities/advisor.entity';
// import { CommonStatusEnum } from 'src/_enum/enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly connection: DataSource,
    // private readonly mailService: MailService,
    // private readonly permissionService: PermissionService,
  ) {}

  async getAuthenticatedUser(loginDto: LoginDto): Promise<User> {
    const user = await this.connection
      .getRepository(User)
      .createQueryBuilder('u')
      .select([
        'u.id_user',
        'u.user_name',
        'u.user_email',
        'u.password',
        'u.status',
      ])
      .where('u.status = :ac', { ac: CommonStatus.ACTIVE })
      .andWhere('u.user_email = :ema', { ema: loginDto?.email })
      .getOne();

    if (!user) throw new NotFoundException('ไม่พบผู้ใข้');

    await this.verifyPassword(loginDto?.password, user?.password);

    return user;
  }

  async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatching = compareSync(plainTextPassword, hashedPassword);
    if (!isPasswordMatching) {
      throw new BadRequestException('รหัสผ่านไม่ถุกต้อง');
    }
  }

  async getJwtTokens(user: User): Promise<TokenDto> {
    const payload = { sub: user.id_user };

    const now = DateTime.now();

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME')}s`,
    });
    const refreshToken = this.jwtService.sign(
      { nonce: now.toMillis() },
      {
        secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: `${this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME')}s`,
      },
    );

    const authData = this.connection.getRepository(AuthLog).create();
    authData.id_user = user.id_user;
    authData.access_token = accessToken;
    authData.refresh_token = refreshToken;
    authData.status = CommonStatus.ACTIVE;

    await this.connection.getRepository(AuthLog).save(authData);

    return {
      require_change_password: false,
      access_token: accessToken,
      refresh_token: refreshToken,
      issue_date: now.toISO({ includeOffset: false }),
      expire_date: now
        .plus({
          seconds: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME'),
        })
        .toISO({ includeOffset: false }),
    };
  }

  //   async tryRefreshTokens(refreshToken: string, user: User): Promise<TokenDto> {
  //     const activeSession = await this.connection
  //       .getRepository(AuthLog)
  //       .findOneBy({
  //         id_user: user.id_user,
  //         refresh_token: refreshToken,
  //         status: CommonStatus.ACTIVE,
  //       });

  //     if (activeSession) {
  //       activeSession.status = CommonStatus.DELETED;

  //       await this.connection.getRepository(AuthLog).save(activeSession);

  //       return await this.getJwtTokens(user);
  //     }

  //     throw new BadRequestException(ErrorMessage.Auth.WRONG_TOKEN);
  //   }

  async logout(accessToken: string, user: User): Promise<boolean> {
    try {
      const activeSession = await this.connection
        .getRepository(AuthLog)
        .findOneBy({
          id_user: user.id_user,
          access_token: accessToken,
          status: CommonStatus.ACTIVE,
        });

      if (activeSession) {
        activeSession.status = CommonStatus.DELETED;

        await this.connection.getRepository(AuthLog).save(activeSession);

        return true;
      }

      throw new NotFoundException(ErrorMessage.Auth.WRONG_TOKEN);
    } catch (err: unknown) {
      console.log(err);
      if (err) throw err;
      throw new InternalServerErrorException();
    }
  }

  async getUserProfile(user: User): Promise<User> {
    const qbUser = this.connection
      .getRepository(User)
      .createQueryBuilder('e')
      .where('1 = 1')
      .andWhere('e.id_user = :id_user', { id_user: user.id_user });
    const resUser = await qbUser.getOne();
    delete resUser?.password;
    return resUser;
  }

  async forgotPassword(email: string): Promise<OTPRefDto> {
    const user = await this.connection
      .getRepository(User)
      .findOneBy({ user_email: email, status: CommonStatus.ACTIVE });
    if (!user) throw new NotFoundException(ErrorMessage.Auth.EMAIL_NOT_FOUND);

    const ref = new RandExp(/^[0-9A-Z]{4}$/).gen();
    const otp = new RandExp(/^[0-9]{6}$/).gen();

    // await this.mailService.sendOTP(email, otp, ref);

    // const otpToSave = this.connection.getRepository(OTPLog).create({
    //   id_user: user.id_user,
    //   otp: otp,
    //   otp_ref: ref,
    //   otp_expired: DateTime.now().plus({ minutes: 5 }).toJSDate(),
    //   send_to: email,
    // });

    // await this.connection.getRepository(OTPLog).save(otpToSave);

    return {
      ref: ref,
    };
  }

  //   async validateOtp(
  //     email: string,
  //     otp: string,
  //     ref: string,
  //   ): Promise<TokenDto> {
  //     const user = await this.connection
  //       .getRepository(User)
  //       .findOneBy({ user_email: email, status: CommonStatus.ACTIVE });
  //     if (!user) throw new NotFoundException(ErrorMessage.Auth.EMAIL_NOT_FOUND);

  //     const otpLog = await this.connection.getRepository(OTPLog).findOneBy({
  //       id_user: user.id_user,
  //       send_to: email,
  //       status: CommonStatus.ACTIVE,
  //       otp: otp,
  //       otp_ref: ref,
  //       otp_expired: MoreThanOrEqual(DateTime.now().toJSDate()),
  //     });

  //     if (otpLog) {
  //       otpLog.status = CommonStatus.DELETED;

  //       await this.connection.getRepository(OTPLog).save(otpLog);

  //       return await this.getJwtTokens(user);
  //     } else throw new BadRequestException(ErrorMessage.Auth.WRONG_OTP);
  //   }

  async updatePassword(user: User, password: string): Promise<boolean> {
    user.password = hashSync(password, genSaltSync(12));
    // user.require_change_password = false

    await this.connection.getRepository(User).save(user);

    return true;
  }
}
