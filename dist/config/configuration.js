"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => ({
    app: {
        name: process.env.APP_NAME ?? 'bookitall-user-service',
        env: process.env.NODE_ENV ?? 'development',
        port: Number(process.env.PORT ?? 3000),
        globalPrefix: process.env.GLOBAL_PREFIX ?? 'api',
    },
});
//# sourceMappingURL=configuration.js.map