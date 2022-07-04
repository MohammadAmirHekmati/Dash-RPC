import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Dash')
    .setDescription('The Dash API description')
    .setVersion('1.0')
    .addTag('Dash')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(9000).then(()=>
  {
    console.log(`Dash Swagger Running on:  http://localhost:9000/docs`);
  })
}
bootstrap();
