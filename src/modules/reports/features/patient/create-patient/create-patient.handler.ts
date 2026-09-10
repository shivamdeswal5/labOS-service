import { Inject, Injectable } from '@nestjs/common';
import { CreatePatientCommand } from './create-patient.command';
import { Patient } from 'src/modules/reports/domain/patient/patient.entity';
import {
  IPatientRepository,
  PATIENT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/patient/interfaces/patient.repository.interface';
import { EntityConflictException } from 'src/modules/shared/domain/exceptions/entity-conflict.exception';
import { SexEnum } from 'src/modules/shared/domain/enums/sex.enum';

@Injectable()
export class CreatePatientHandler {
  constructor(
    @Inject(PATIENT_REPOSITORY_TOKEN)
    private readonly patientRepository: IPatientRepository,
  ) {}

  async execute(command: CreatePatientCommand): Promise<Patient> {
    const { labId, dto } = command;

    const existing = await this.patientRepository.findByPatientNumber(labId, dto.patientNumber);
    if (existing) {
      throw new EntityConflictException(`Patient number '${dto.patientNumber}' already exists in this lab`);
    }

    return this.patientRepository.create({
      labId,
      patientNumber: dto.patientNumber,
      name: dto.name,
      age: dto.age ?? null,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      sex: dto.sex ?? SexEnum.OTHER,
      phone: dto.phone ?? null,
      address: dto.address ?? null,
    });
  }
}
