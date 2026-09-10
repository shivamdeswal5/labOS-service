import { Inject, Injectable } from '@nestjs/common';
import { GetPatientQuery } from './get-patient.query';
import { Patient } from 'src/modules/reports/domain/patient/patient.entity';
import {
  IPatientRepository,
  PATIENT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/patient/interfaces/patient.repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class GetPatientHandler {
  constructor(
    @Inject(PATIENT_REPOSITORY_TOKEN)
    private readonly patientRepository: IPatientRepository,
  ) {}

  async execute(query: GetPatientQuery): Promise<Patient> {
    const patient = await this.patientRepository.findById(query.patientId, query.labId);
    if (!patient) {
      throw new EntityNotFoundException('Patient', query.patientId);
    }
    return patient;
  }
}
