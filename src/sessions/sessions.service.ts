import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './sessions.entity';
import { CreateSessionDto } from './dtos/create-session.dtos';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async create(createSessionDto: CreateSessionDto): Promise<Session> {
    const session = this.sessionRepository.create(createSessionDto);
    return this.sessionRepository.save(session);
  }

  async remove(connectionId: string): Promise<void> {
    await this.sessionRepository.delete({ connection_id: connectionId });
  }
}
