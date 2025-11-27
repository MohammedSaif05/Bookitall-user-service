declare const NODE_ENV_VALUES: readonly ["development", "test", "staging", "production"];
declare class EnvironmentVariables {
    NODE_ENV?: (typeof NODE_ENV_VALUES)[number];
    APP_NAME?: string;
    PORT?: number;
    GLOBAL_PREFIX?: string;
}
export declare const validateEnv: (config: Record<string, unknown>) => EnvironmentVariables;
export {};
