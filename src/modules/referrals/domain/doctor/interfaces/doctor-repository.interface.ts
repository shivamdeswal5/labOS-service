import { ReferringDoctor } from '../referring-doctor.entity';

export const DOCTOR_REPOSITORY_TOKEN = Symbol('IDoctorRepository');

export interface IDoctorRepository {
  findById(id: string, labId: string): Promise<ReferringDoctor | null>;
  findByLabId(labId: string, search?: string): Promise<ReferringDoctor[]>;
  save(doctor: ReferringDoctor): Promise<ReferringDoctor>;
  create(data: Partial<ReferringDoctor>): Promise<ReferringDoctor>;
  softDelete(id: string, labId: string): Promise<boolean>;
}
