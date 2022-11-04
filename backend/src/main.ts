import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: "Content-Type, Accept, Authorization",
  };
  app.enableCors(corsOptions);

  const config = new DocumentBuilder()
    .setTitle("Proof of Snake API")
    .setDescription("SSSSSSSSSSSSSSSSssssssssssSSSSSSSSss")
    .setVersion("0.1")
    .addTag("Group 4 Encode Capstone Project")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
  await app.listen(3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
