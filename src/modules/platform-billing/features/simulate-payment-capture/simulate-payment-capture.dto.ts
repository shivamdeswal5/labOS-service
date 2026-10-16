import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum SimulatePaymentActionEnum {
  SUCCESS = 'SUCCESS',
  DECLINE = 'DECLINE',
  TIMEOUT = 'TIMEOUT',
}

export class SimulatePaymentCaptureDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsNotEmpty()
  @IsEnum(SimulatePaymentActionEnum)
  action: SimulatePaymentActionEnum;
}
