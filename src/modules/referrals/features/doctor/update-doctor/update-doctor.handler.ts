import { Inject, Injectable } from '@nestjs/common';
import { UpdateDoctorCommand } from './update-doctor.command';
import { ReferringDoctor } from 'src/modules/referrals/domain/doctor/referring-doctor.entity';
import {
  IDoctorRepository,
  DOCTOR_REPOSITORY_TOKEN,
} from 'src/modules/referrals/domain/doctor/interfaces/doctor-repository.interface';
import { EntityNotFoundException } from 'src/modules/shared/domain/exceptions/entity-not-found.exception';

@Injectable()
export class UpdateDoctorHandler {
  constructor(
    @Inject(DOCTOR_REPOSITORY_TOKEN)
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(command: UpdateDoctorCommand): Promise<ReferringDoctor> {
    const { doctorId, labId, dto } = command;

    const doctor = await this.doctorRepository.findById(doctorId, labId);
    if (!doctor) {
      throw new EntityNotFoundException('ReferringDoctor', doctorId);
    }

    if (dto.name !== undefined) doctor.name = dto.name;
    if (dto.clinic !== undefined) doctor.clinic = dto.clinic;
    if (dto.phone !== undefined) doctor.phone = dto.phone;
    if (dto.email !== undefined) doctor.email = dto.email;
    if (dto.commissionType !== undefined) doctor.commissionType = dto.commissionType;
    if (dto.commissionValue !== undefined) doctor.commissionValue = dto.commissionValue;
    if (dto.notes !== undefined) doctor.notes = dto.notes;

    return this.doctorRepository.save(doctor);
  }
}
