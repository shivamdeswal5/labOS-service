import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignPhlebotomistDto {
  @IsUUID()
  @IsNotEmpty()
  phlebotomistId: string;

  @IsString()
  @IsNotEmpty()
  phlebotomistName: string;
}
