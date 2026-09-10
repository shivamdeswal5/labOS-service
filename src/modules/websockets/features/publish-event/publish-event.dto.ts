import { IsArray, IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { RealtimeChannelEnum } from '../../contracts/enums/realtime-channel.enum';

export class PublishEventDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  channels: string[];

  @IsEnum(RealtimeChannelEnum)
  event: RealtimeChannelEnum;

  @IsObject()
  payload: Record<string, any>;
}
