import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/request/login.dto';
import { User } from 'src/_entity/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'email',
            passwordField: 'password',
          });
    }

    async validate(email: string, password: string): Promise<User> {
        const loginDto = new LoginDto();
        loginDto.email = email;
        loginDto.password = password;
        return await this.authService.getAuthenticatedUser(loginDto);
    }
}