import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './sessions.entity';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  async createSession(userId: string, deviceId: string): Promise<Session> {
    const session = this.sessionRepo.create({ userId, deviceId });
    return this.sessionRepo.save(session);
  }

  async findActiveSessions(userId: string): Promise<Session[]> {
    return this.sessionRepo.find({
      where: { userId, isActive: true },
    });
  }

  async updateLastActive(sessionId: string): Promise<void> {
    await this.sessionRepo.update(sessionId, { lastActive: new Date() });
  }

  async closeSession(sessionId: string): Promise<void> {
    await this.sessionRepo.update(sessionId, { isActive: false });
  }
}
