// update-message.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
    message: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
    response: string;
}
