import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';

export class AddMemberDto {
  @IsUUID('4', { message: 'User ID must be a valid UUID from Supabase Auth' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MinLength(2)
  fullName: string;

  @IsIn([RoleEnum.TECHNICIAN, RoleEnum.PATHOLOGIST, RoleEnum.PHLEBOTOMIST], {
    message: 'Role must be TECHNICIAN, PATHOLOGIST, or PHLEBOTOMIST',
  })
  role: RoleEnum.TECHNICIAN | RoleEnum.PATHOLOGIST | RoleEnum.PHLEBOTOMIST;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  qualification?: string | null;
}
