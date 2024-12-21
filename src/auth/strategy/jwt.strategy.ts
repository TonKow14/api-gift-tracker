import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { DataSource } from 'typeorm';
import { DateTime } from 'luxon';
import { AuthLog } from 'src/_entity/auth-log.entity';
import { ErrorMessage } from 'src/_enum/error-message';
import { CommonStatus } from 'src/_enum/common.status';
import { User } from 'src/_entity/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly connection: DataSource,
        private readonly configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
            passReqToCallback: true,
        });
    }

    async validate(request: Request, payload: any) {
        const accessToken = request.headers.authorization.slice('Bearer '.length);

        const activeSession = await this.connection.getRepository(AuthLog).findOneBy({
            id_user: payload.sub,
            access_token: accessToken,
            status: CommonStatus.ACTIVE
        })

        if (!activeSession) {
            throw new UnauthorizedException(ErrorMessage.Auth.WRONG_TOKEN);
        }

        const employee = await this.connection.getRepository(User).findOneBy({ id_user: payload.sub, status: CommonStatus.ACTIVE });

        return employee;
    }
}