import {
    Injectable,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async signup(signupDto: SignupDto) {
        const { name, email, password } = signupDto;

        const existingUser = await this.usersService.findByEmail(email);

        if (existingUser) {
            throw new ConflictException('Email already exits',);
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.usersService.create({
            name,
            email,
            password: hashedPassword,
        });
        return {
            message: 'User created successfully',
            userId: user.id,
        }
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        const user =
            await this.usersService.findByEmail(email);

        if (!user) {
            throw new UnauthorizedException(
                'Invalid credentials',
            );
        }

        const isPasswordValid =
            await bcrypt.compare(
                password,
                user.password,
            );

        if (!isPasswordValid) {
            throw new UnauthorizedException(
                'Invalid credentials',
            );
        }

        const payload = {
            sub: user.id,
            email: user.email,
        };

        const accessToken =
            this.jwtService.sign(payload);

        return {
            access_token: accessToken,
        };
    }
}