import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from 'src/modules/reports/domain/patient/patient.entity';
import { Report } from 'src/modules/reports/domain/report/report.entity';
import { ReportPanel } from 'src/modules/reports/domain/report/report-panel.entity';
import { ReportValue } from 'src/modules/reports/domain/report/report-value.entity';
import { ReportAmendment } from 'src/modules/reports/domain/report/report-amendment.entity';
import { PATIENT_REPOSITORY_TOKEN } from 'src/modules/reports/domain/patient/interfaces/patient.repository.interface';
import { REPORT_REPOSITORY_TOKEN } from 'src/modules/reports/domain/report/interfaces/report.repository.interface';
import { PatientRepository } from './repositories/patient.repository';
import { ReportRepository } from './repositories/report.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      Report,
      ReportPanel,
      ReportValue,
      ReportAmendment,
    ]),
  ],
  providers: [
    {
      provide: PATIENT_REPOSITORY_TOKEN,
      useClass: PatientRepository,
    },
    {
      provide: REPORT_REPOSITORY_TOKEN,
      useClass: ReportRepository,
    },
  ],
  exports: [PATIENT_REPOSITORY_TOKEN, REPORT_REPOSITORY_TOKEN],
})
export class ReportsDatabaseModule {}
