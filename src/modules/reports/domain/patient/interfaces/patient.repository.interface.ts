import { Patient } from '../patient.entity';

export const PATIENT_REPOSITORY_TOKEN = Symbol('IPatientRepository');

export interface IPatientRepository {
  findById(id: string, labId: string): Promise<Patient | null>;
  findByLabId(labId: string, search?: string): Promise<Patient[]>;
  findByPatientNumber(labId: string, patientNumber: string): Promise<Patient | null>;
  save(patient: Patient): Promise<Patient>;
  create(data: Partial<Patient>): Promise<Patient>;
  softDelete(id: string, labId: string): Promise<boolean>;
}
