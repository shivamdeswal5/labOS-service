import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class SeedTemplatesDto {
  @IsArray()
  @IsUUID('4', { each: true, message: 'Template ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Select at least one panel template to seed' })
  templateIds: string[];
}
