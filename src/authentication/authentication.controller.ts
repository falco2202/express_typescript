import * as bcrypt from 'bcrypt';
import * as express from 'express';

import Controller  from '../interfaces/controller.interface';
import userModel from '../users/user.model';
import { CreateUserDto } from '../users/user.dto';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import validationMiddleware from '../middlewares/validation.middleware';
import LogInDto from './logIn.dto';
import WrongCredentialsException from '../exceptions/WrongCredentialsException';
import TokenData from 'interfaces/tokenData.interface';
import User from '../users/user.interface';
import DataStoredInToken from 'interfaces/dataStoredInToken.interface';
import * as jwt from 'jsonwebtoken';

class AuthenticationController implements Controller {
  public path = '/auth';
  public router = express.Router();
  private user = userModel;

  constructor() {
    this.intialzeRoutes();
  }

  private intialzeRoutes() {
    this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration);
    this.router.post(`${this.path}/login`, validationMiddleware(LogInDto), this.LogginIn);
    this.router.post(`${this.path}/logut`, this.logout)
  }

  private registration = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userData: CreateUserDto = req.body;

    if(await this.user.findOne({email: userData.email})) {
      next(new UserWithThatEmailAlreadyExistsException(userData.email));
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await this.user.create({
        ...userData,
        password: hashedPassword
      });
      user.password = undefined;
      return res.send(user);
    }
  }

  private LogginIn = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const logInData: LogInDto = req.body;
    const user = await this.user.findOne({email: logInData.email});
    if(!user) {
      return next(new WrongCredentialsException());
    }
    const isPasswordMatching = await bcrypt.compare(logInData.password, user.password)
    if(isPasswordMatching) {
      user.password = undefined;
      const tokenData = this.createToken(user);
      res.setHeader('Set-Cookie', [this.createCookie(tokenData)])
      res.send(user);
    } else {
      return next(new WrongCredentialsException());
    }
  }

  private logout =  (req: express.Request, res: express.Response) => {
    res.setHeader('Set-Cookie', ['Authorization=;Max-age=0']);
    res.send(200)
  }

  private createToken(user: User) : TokenData {
    const expiresIn = 60 * 60;
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken : DataStoredInToken = {
      _id : user._id,
    };

    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn })
    }
  }

  private createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  }
}

export default AuthenticationController;