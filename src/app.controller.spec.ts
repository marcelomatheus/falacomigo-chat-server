import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Response } from 'express';
describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return a file', () => {
      const res = { sendFile: jest.fn() } as unknown as Response;

      appController.getHello(res);
      expect(res['sendFile']).toHaveBeenCalledWith(
        expect.stringContaining('index.html'),
      );
    });
  });
});
