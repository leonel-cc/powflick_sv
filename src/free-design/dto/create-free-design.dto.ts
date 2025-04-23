import { IsString, IsArray, IsBoolean, IsOptional, IsDateString } from 'class-validator';

export class CreateFreeDesignDto {
  @IsString()
    teamName: string;

  @IsString()
    sport: string;

  @IsString()
    color: string;

  @IsOptional()
  @IsString()
    description?: string;

  @IsOptional()
  @IsDateString()
    date?: string;

  @IsArray()
    primaryColors: string[];

  @IsArray()
    secondaryColors: string[];

  @IsBoolean()
    addNames: boolean;

  @IsBoolean()
    addNumbers: boolean;

  @IsArray()
    logos: string[];

  @IsArray()
    otherImages: string[];

  @IsString()
    fullName: string;

  @IsString()
    email: string;

  @IsOptional()
  @IsString()
    organization?: string;

  @IsOptional()
  @IsString()
    phone?: string;
}
