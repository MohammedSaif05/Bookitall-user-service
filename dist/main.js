"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const compression_1 = __importDefault(require("compression"));
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const createHelmetMiddleware = () => {
    const factory = helmet_1.default;
    return factory();
};
const createCompressionMiddleware = () => {
    const factory = compression_1.default;
    return factory();
};
const registerRootProbeHandlers = (app) => {
    const server = app.getHttpAdapter().getInstance();
    const okResponse = (_req, res) => res.status(200).json({ status: "ok" });
    server.get("/", okResponse);
    server.head("/", (_req, res) => res.sendStatus(200));
};
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    const configService = app.get(config_1.ConfigService);
    const reflector = app.get(core_1.Reflector);
    app.use(createHelmetMiddleware());
    app.use(createCompressionMiddleware());
    app.enableCors();
    app.enableShutdownHooks();
    registerRootProbeHandlers(app);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidUnknownValues: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(reflector), new logging_interceptor_1.LoggingInterceptor(), new response_interceptor_1.ResponseInterceptor());
    const globalPrefix = configService.get("app.globalPrefix", "api");
    app.setGlobalPrefix(globalPrefix, { exclude: ["health"] });
    const port = configService.get("app.port", 3000);
    await app.listen(port);
}
bootstrap().catch((error) => {
    console.error("Failed to bootstrap application", error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map