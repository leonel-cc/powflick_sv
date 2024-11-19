import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ActivateReviewDto {
  @ApiProperty({
    description:
      'id de la reseña a desactivar o activar. Debe ser de tipo UUIDV4',
    type: 'string',
  })
  @IsUUID(4, {
    message: '$property must be a valid uuid version $constraint1',
  })
  //reviewId
    reviewId: string;
}
