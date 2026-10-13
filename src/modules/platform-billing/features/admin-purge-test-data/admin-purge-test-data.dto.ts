import { IsString, IsNotEmpty, Equals } from 'class-validator';

export class AdminPurgeTestDataDto {
  @IsString()
  @IsNotEmpty()
  @Equals('PURGE')
  confirmation: string;
}
