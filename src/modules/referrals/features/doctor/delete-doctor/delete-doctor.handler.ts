import { Inject, Injectable } from '@nestjs/common';
import { DeleteDoctorCommand } from './delete-doctor.command';
import {
  IDoctorRepository,
  DOCTOR_REPOSITORY_TOKEN,
} from 'src/modules/referrals/domain/doctor/interfaces/doctor-repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class DeleteDoctorHandler {
  constructor(
    @Inject(DOCTOR_REPOSITORY_TOKEN)
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(command: DeleteDoctorCommand): Promise<boolean> {
    const { doctorId, labId } = command;

    const doctor = await this.doctorRepository.findById(doctorId, labId);
    if (!doctor) {
      throw new EntityNotFoundException('ReferringDoctor', doctorId);
    }

    return this.doctorRepository.softDelete(doctorId, labId);
  }
}
