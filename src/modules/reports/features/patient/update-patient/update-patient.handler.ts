import { Inject, Injectable } from '@nestjs/common';
import { UpdatePatientCommand } from './update-patient.command';
import { Patient } from 'src/modules/reports/domain/patient/patient.entity';
import {
  IPatientRepository,
  PATIENT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/patient/interfaces/patient.repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class UpdatePatientHandler {
  constructor(
    @Inject(PATIENT_REPOSITORY_TOKEN)
    private readonly patientRepository: IPatientRepository,
  ) {}

  async execute(command: UpdatePatientCommand): Promise<Patient> {
    const { patientId, labId, dto } = command;

    const patient = await this.patientRepository.findById(patientId, labId);
    if (!patient) {
      throw new EntityNotFoundException('Patient', patientId);
    }

    if (dto.name !== undefined) patient.name = dto.name;
    if (dto.age !== undefined) patient.age = dto.age ?? null;
    if (dto.dateOfBirth !== undefined) {
      patient.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    }
    if (dto.sex !== undefined) patient.sex = dto.sex;
    if (dto.phone !== undefined) patient.phone = dto.phone ?? null;
    if (dto.address !== undefined) patient.address = dto.address ?? null;

    return this.patientRepository.save(patient);
  }
}
