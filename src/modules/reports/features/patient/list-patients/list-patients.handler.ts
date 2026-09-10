import { Inject, Injectable } from '@nestjs/common';
import { ListPatientsQuery } from './list-patients.query';
import { Patient } from 'src/modules/reports/domain/patient/patient.entity';
import {
  IPatientRepository,
  PATIENT_REPOSITORY_TOKEN,
} from 'src/modules/reports/domain/patient/interfaces/patient.repository.interface';

@Injectable()
export class ListPatientsHandler {
  constructor(
    @Inject(PATIENT_REPOSITORY_TOKEN)
    private readonly patientRepository: IPatientRepository,
  ) {}

  async execute(query: ListPatientsQuery): Promise<Patient[]> {
    return this.patientRepository.findByLabId(query.labId, query.search);
  }
}
