import * as jwt from 'jsonwebtoken';
import { Injectable, Inject, HttpException, HttpStatus, forwardRef } from '@nestjs/common';
import { UsersService } from './../users/users.service';

@Injectable()
export class AuthService {

  private authorizedUser;

  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,) {
  }

  async createToken() {
    const expiresIn = '60h',
      secretOrKey = 'secret';
    const user = { username: this.authorizedUser.username };
    const token = jwt.sign(user, secretOrKey, { expiresIn });
    return {
      expires_in: expiresIn,
      access_token: token,
    };
  }

  async getAccessToken(user) {
    const validUser = await this.validateLogin(user);
    if (validUser) {
      return await this.createToken();
    } else {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  }

  validateLogin(user): boolean {
    try {
      const existedUser = this.usersService.findOneByUsername(user.username);
      if (existedUser !== null) {
        this.authorizedUser = existedUser;
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  checkToken(token): boolean {
    try {
      const user = jwt.verify(token, 'secret');
      return this.validateLogin(user);
    } catch (err) {
      return false;
    }
  }

  validateUser(signedUser): boolean {
    return true;
  }
}
