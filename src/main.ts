import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory, Reflector } from "@nestjs/core";
import compression from "compression";
import helmet from "helmet";
import type { Express, Request, RequestHandler, Response } from "express";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";

const createHelmetMiddleware = (): RequestHandler => {
  const factory = helmet as unknown as () => RequestHandler;
  return factory();
};

const createCompressionMiddleware = (): RequestHandler => {
  const factory = compression as unknown as () => RequestHandler;
  return factory();
};

const registerRootProbeHandlers = (app: INestApplication) => {
  const server = app.getHttpAdapter().getInstance() as Express;

  const okResponse = (_req: Request, res: Response) =>
    res.status(200).json({ status: "ok" });

  server.get("/", okResponse);
  server.head("/", (_req: Request, res: Response) => res.sendStatus(200));
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  app.use(createHelmetMiddleware());
  app.use(createCompressionMiddleware());
  app.enableCors();
  app.enableShutdownHooks();
  registerRootProbeHandlers(app);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );

  const globalPrefix = configService.get<string>("app.globalPrefix", "api");
  app.setGlobalPrefix(globalPrefix, { exclude: ["health"] });

  const port = configService.get<number>("app.port", 3000);
  await app.listen(port);
}
bootstrap().catch((error: unknown) => {
  console.error("Failed to bootstrap application", error);
  process.exit(1);
});
