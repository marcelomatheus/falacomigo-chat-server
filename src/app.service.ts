import { Injectable } from '@nestjs/common';
import { join } from 'path';
@Injectable()
export class AppService {
  getHello(): string {
    return join(__dirname, 'public', 'index.html');
  }
  getHello2(): string {
    return join(__dirname, 'public', 'app.html');
  }
}
