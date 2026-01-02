declare const NODE_ENV_VALUES: readonly ["development", "test", "staging", "production"];
declare class EnvironmentVariables {
    NODE_ENV?: (typeof NODE_ENV_VALUES)[number];
    APP_NAME?: string;
    PORT?: number;
    GLOBAL_PREFIX?: string;
    MONGODB_URI: string;
    R2_ENDPOINT?: string;
    R2_BUCKET?: string;
    R2_ACCESS_KEY_ID?: string;
    R2_SECRET_ACCESS_KEY?: string;
    R2_REGION?: string;
    R2_PUBLIC_BASE: string;
}
export declare const validateEnv: (config: Record<string, unknown>) => EnvironmentVariables;
export {};
