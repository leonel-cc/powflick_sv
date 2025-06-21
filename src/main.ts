import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import * as express from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { PORT } from './config/enviroments';
import * as path from 'path';
const port = PORT ?? 3001;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Pow Flick API')
    .setDescription('All endpoints')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('TheSportsApi', app, document);

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
  // Configuración de Express
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));
  app.use(express.static(path.join(__dirname, 'public')));

  await app.listen(port);
  console.log('server raised in port: ' + port);
}
bootstrap();
