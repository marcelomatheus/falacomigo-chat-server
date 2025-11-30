import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { Public } from '@/auth/decorators/public.decorator';
@Public()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(@Res() res: Response): void {
    res.sendFile(this.appService.getHello());
  }
  @Get('app')
  getHello2(@Res() res: Response): void {
    res.sendFile(this.appService.getHello2());
  }
}
