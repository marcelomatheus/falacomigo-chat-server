import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Fala Comigo')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      // persistAuthorization: true,
      // displayRequestDuration: true,
      // defaultModelsExpandDepth: -1,
      // supportedSubmitMethods: [],
    },
    customSiteTitle: 'Fala Comigo API Documentation',
  });
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap().catch((err) => {
  console.error('Error during app bootstrap:', err);
});
