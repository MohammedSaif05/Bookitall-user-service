export default () => ({
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
  },
});
