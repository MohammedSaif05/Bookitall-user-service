"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    app: {
        name: process.env.APP_NAME ?? "bookitall-user-service",
        env: process.env.NODE_ENV ?? "development",
        port: Number(process.env.PORT ?? 3000),
        globalPrefix: process.env.GLOBAL_PREFIX ?? "api",
    },
    database: {
        uri: process.env.MONGODB_URI ?? "",
    },
    r2: {
        endpoint: process.env.R2_ENDPOINT,
        bucket: process.env.R2_BUCKET,
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        region: process.env.R2_REGION ?? "auto",
        publicBase: process.env.R2_PUBLIC_BASE,
    },
    ifsc: {
        apiKey: process.env.IFSC_API_KEY ??
            "f55035261a94b50103de695b1b7692ada9db9bbb28f957d57a46dd35aafa8e90",
    },
});
//# sourceMappingURL=configuration.js.map