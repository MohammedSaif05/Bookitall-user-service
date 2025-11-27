import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

const NODE_ENV_VALUES = ['development', 'test', 'staging', 'production'] as const;

class EnvironmentVariables {
  @IsEnum(NODE_ENV_VALUES, {
    message: `NODE_ENV must be one of: ${NODE_ENV_VALUES.join(', ')}`,
  })
  @IsOptional()
  NODE_ENV?: (typeof NODE_ENV_VALUES)[number];

  @IsString()
  @IsOptional()
  APP_NAME?: string;

  @IsNumber()
  @IsOptional()
  PORT?: number;

  @IsString()
  @IsOptional()
  GLOBAL_PREFIX?: string;
}

export const validateEnv = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  if (!validatedConfig.NODE_ENV) {
    validatedConfig.NODE_ENV = 'development';
  }

  return validatedConfig;
};


