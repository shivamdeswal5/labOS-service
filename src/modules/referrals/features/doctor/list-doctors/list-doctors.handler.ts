import { Inject, Injectable } from '@nestjs/common';
import { ListDoctorsQuery } from './list-doctors.query';
import { ReferringDoctor } from 'src/modules/referrals/domain/doctor/referring-doctor.entity';
import {
  IDoctorRepository,
  DOCTOR_REPOSITORY_TOKEN,
} from 'src/modules/referrals/domain/doctor/interfaces/doctor-repository.interface';

@Injectable()
export class ListDoctorsHandler {
  constructor(
    @Inject(DOCTOR_REPOSITORY_TOKEN)
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(query: ListDoctorsQuery): Promise<ReferringDoctor[]> {
    const { labId, search } = query;
    return this.doctorRepository.findByLabId(labId, search);
  }
}
