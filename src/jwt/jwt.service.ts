import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { JwtModuleOptions } from './jwt.interfaces';
import { CONFIG_OPTIONS } from './jwt.constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
    private readonly configService: ConfigService,
  ) {
    console.log(options);
  }

  sign(userId: number): string {
    return jwt.sign({ id: userId }, this.configService.get('PRIVATE_KEY'));
  }

  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
