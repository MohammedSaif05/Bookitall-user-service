import { IsString, Matches } from "class-validator";

export class BreakDto {
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "break_start must be in HH:MM format (24-hour)",
  })
  break_start!: string;

  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "break_end must be in HH:MM format (24-hour)",
  })
  break_end!: string;
}
