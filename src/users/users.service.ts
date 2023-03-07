import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserProfileOutput } from './dtos/user-proifle.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verification: Repository<Verification>,
    private readonly jwtService: JwtService,
  ) {
    // this.jwtService.hello();
  }

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const exists = await this.users.findOne({ where: { email } });
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      }

      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );

      await this.verification.save(
        this.verification.create({
          user,
        }),
      );
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Could'nt create account" };
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    // find the user with the email
    // check if the password is correct
    // make a JWT and give it to the user
    try {
      const user = await this.users.findOne({
        where: { email },
        select: ['id', 'password'],
      });
      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      console.log(user);
      const token = this.jwtService.sign(user.id);

      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOne({
        where: { id },
      });
      if (user) {
        return {
          ok: true,
          user: user,
        };
      }
    } catch (error) {
      return {
        ok: false,
        error: 'User Not Found',
      };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne({ where: { id: userId } });
      // users.update를 통해서 업데이트하면 BeforeUpdate가 동작하지 않는다.
      // 왜? ==> update는 entity가 있든 없든 최적의 속도로 업데이트하는 동작,
      // 때문에 entity가 있는지 없는지 확인하지 않고 그저 DB에 query만 보내는것과 같다.
      if (email) {
        user.email = email;
        user.verified = false;
        await this.verification.save(this.verification.create({ user }));
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
    } catch (error) {
      return { ok: false, error: 'Could not update' };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verification.findOne({
        where: { code },
        relations: ['user'],
      });

      if (verification) {
        verification.user.verified = true;
        console.log(verification.user);
        await this.users.save(verification.user);
        await this.verification.delete(verification.id);
        return { ok: true };
      }
      throw new Error();
    } catch (error) {
      return { ok: false, error };
    }
  }
}
