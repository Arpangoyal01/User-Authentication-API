import {
  Injectable,
  ConflictException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService{
    constructor(
        private readonly usersService: UsersService,
    ){}

    async signup(signupDto: SignupDto){
        const {name, email, password} = signupDto;
        
        const existingUser= await this.usersService.findByEmail(email);

        if(existingUser){
            throw new ConflictException('Email already exits',);
        }
        const hashedPassword = await bcrypt.hash(password,10);

        const user = await this.usersService.create({
            name,
            email,
            password:hashedPassword,
        });
        return {
            message:'User created successfully',
            userId:user.id,
        }
    }
}