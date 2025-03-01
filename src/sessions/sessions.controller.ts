import { Controller, Post, Delete, Body } from '@nestjs/common';
import { SessionsService } from './sessions.service';

import { CreateSessionDto } from './dtos/create-session.dtos';
import { DeleteSessionDto } from './dtos/delete-session.dto';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  async create(@Body() createSessionDto: CreateSessionDto) {
    return this.sessionsService.create(createSessionDto);
  }

  @Delete()
  async remove(@Body() deleteSessionDto: DeleteSessionDto) {
    await this.sessionsService.remove(deleteSessionDto.connection_id);
    return { message: 'Session removed successfully' };
  }
}
