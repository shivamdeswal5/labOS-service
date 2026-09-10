import { Inject, Injectable } from '@nestjs/common';
import { CreateDoctorCommand } from './create-doctor.command';
import { ReferringDoctor } from 'src/modules/referrals/domain/doctor/referring-doctor.entity';
import {
  IDoctorRepository,
  DOCTOR_REPOSITORY_TOKEN,
} from 'src/modules/referrals/domain/doctor/interfaces/doctor-repository.interface';
import { CommissionTypeEnum } from 'src/modules/referrals/domain/doctor/enums/commission-type.enum';

@Injectable()
export class CreateDoctorHandler {
  constructor(
    @Inject(DOCTOR_REPOSITORY_TOKEN)
    private readonly doctorRepository: IDoctorRepository,
  ) {}

  async execute(command: CreateDoctorCommand): Promise<ReferringDoctor> {
    const { labId, dto } = command;

    return this.doctorRepository.create({
      labId,
      name: dto.name,
      clinic: dto.clinic ?? null,
      phone: dto.phone ?? null,
      email: dto.email ?? null,
      commissionType: dto.commissionType ?? CommissionTypeEnum.NONE,
      commissionValue: dto.commissionValue ?? 0,
      notes: dto.notes ?? null,
    });
  }
}
