import { IsArray, IsString, Matches, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { BreakDto } from "./break.dto.js";

export class DayDto {
  @IsString()
  day!: string;

  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "start_time must be in HH:MM format (24-hour)",
  })
  start_time!: string;

  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "end_time must be in HH:MM format (24-hour)",
  })
  end_time!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BreakDto)
  breaks!: BreakDto[];
}

