import { IsNotEmpty, IsString } from 'class-validator';

export class CancelCollectionDto {
  @IsString()
  @IsNotEmpty()
  cancellationReason: string;
}
