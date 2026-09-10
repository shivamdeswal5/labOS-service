import { Inject, Injectable } from '@nestjs/common';
import { GetDoctorQuery } from './get-doctor.query';
import { ReferringDoctor } from 'src/modules/referrals/domain/doctor/referring-doctor.entity';
import {
  IDoctorRepository,
  DOCTOR_REPOSITORY_TOKEN,
} from 'src/modules/referrals/domain/doctor/interfaces/doctor-repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class GetDoctorHandler {
  constructor(
    @Inject(DOCTOR_REPOSITORY_TOKEN)
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(query: GetDoctorQuery): Promise<ReferringDoctor> {
    const { doctorId, labId } = query;

    const doctor = await this.doctorRepository.findById(doctorId, labId);
    if (!doctor) {
      throw new EntityNotFoundException('ReferringDoctor', doctorId);
    }

    return doctor;
  }
}
