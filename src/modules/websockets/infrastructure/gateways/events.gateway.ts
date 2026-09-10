import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { SupabaseService } from 'src/modules/shared/infrastructure/supabase/supabase.service';
import {
  PROFILE_REPOSITORY_TOKEN,
  IProfileRepository,
} from 'src/modules/labs/domain/profile/interfaces/profile.repository.interface';
import { RoleEnum } from 'src/modules/labs/domain/profile/enums/role.enum';
import { RealtimeRoomBuilder } from '../../contracts/realtime-room.builder';
import { EventMessage } from '../../contracts/event-message.interface';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    @Inject(PROFILE_REPOSITORY_TOKEN)
    private readonly profileRepository: IProfileRepository,
  ) {}

  afterInit(_server: Server) {
    this.logger.log('EventsGateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const authHeader =
        (client.handshake.auth?.token as string) ||
        (client.handshake.headers?.authorization as string);

      if (!authHeader) {
        this.logger.warn(`Client ${client.id} disconnected: Missing authorization token`);
        client.disconnect(true);
        return;
      }

      const token = authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authHeader;

      const supabaseUser = await this.supabaseService.getUserFromToken(token);
      if (!supabaseUser) {
        this.logger.warn(`Client ${client.id} disconnected: Invalid Supabase token`);
        client.disconnect(true);
        return;
      }

      const profile = await this.profileRepository.findById(supabaseUser.id);
      if (!profile || !profile.labId) {
        this.logger.warn(`Client ${client.id} disconnected: Profile or Lab not found`);
        client.disconnect(true);
        return;
      }

      client.data = {
        userId: supabaseUser.id,
        labId: profile.labId,
        role: profile.role,
      };

      const labRoom = RealtimeRoomBuilder.lab(profile.labId);
      const userRoom = RealtimeRoomBuilder.user(supabaseUser.id);
      await client.join(labRoom);
      await client.join(userRoom);

      if (profile.role === RoleEnum.PATHOLOGIST) {
        const doctorsRoom = RealtimeRoomBuilder.doctors(profile.labId);
        await client.join(doctorsRoom);
      }

      this.logger.log(
        `Client ${client.id} connected [User: ${supabaseUser.id}, Lab: ${profile.labId}, Role: ${profile.role}]`,
      );
    } catch (error) {
      this.logger.error(`Error during socket connection for client ${client.id}:`, error);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  publishToClients(message: EventMessage): void {
    if (!this.server) {
      this.logger.warn('WebSocket server is not initialized yet. Skipping publish.');
      return;
    }

    if (!message.channels || message.channels.length === 0) {
      this.logger.warn(`No target channels provided for event ${message.event}`);
      return;
    }

    this.server.to(message.channels).emit(message.event, message);
    this.logger.log(
      `Broadcasted event [${message.event}] to channels: ${message.channels.join(', ')}`,
    );
  }
}
