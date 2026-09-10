import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from 'src/modules/reports/domain/patient/patient.entity';
import { IPatientRepository } from 'src/modules/reports/domain/patient/interfaces/patient.repository.interface';

@Injectable()
export class PatientRepository implements IPatientRepository {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
  ) {}

  async findById(id: string, labId: string): Promise<Patient | null> {
    return this.patientRepo.findOne({
      where: { id, labId },
    });
  }

  async findByLabId(labId: string, search?: string): Promise<Patient[]> {
    const query = this.patientRepo
      .createQueryBuilder('patient')
      .where('patient.lab_id = :labId', { labId })
      .andWhere('patient.deleted_at IS NULL');

    if (search) {
      query.andWhere(
        '(patient.name ILIKE :search OR patient.phone ILIKE :search OR patient.patient_number ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return query
      .orderBy('patient.created_at', 'DESC')
      .getMany();
  }

  async findByPatientNumber(labId: string, patientNumber: string): Promise<Patient | null> {
    return this.patientRepo.findOne({
      where: { labId, patientNumber },
    });
  }

  async save(patient: Patient): Promise<Patient> {
    return this.patientRepo.save(patient);
  }

  async create(data: Partial<Patient>): Promise<Patient> {
    const patient = this.patientRepo.create(data);
    return this.patientRepo.save(patient);
  }

  async softDelete(id: string, labId: string): Promise<boolean> {
    const result = await this.patientRepo.softDelete({ id, labId });
    return (result.affected ?? 0) > 0;
  }
}
