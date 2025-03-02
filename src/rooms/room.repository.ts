import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './room.entity';

@Injectable()
export class RoomRepository {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
  ) {}

  async findRoomByUser(userId: string): Promise<Room | null> {
    return this.roomRepo.findOne({ where: { userId } });
  }

  async createRoom(userId: string, device1: string): Promise<Room> {
    const room = this.roomRepo.create({ userId, device1 });
    return this.roomRepo.save(room);
  }

  async addSecondDevice(roomId: string, device2: string): Promise<void> {
    await this.roomRepo.update(roomId, { device2 });
  }

  async removeDevice(roomId: string, deviceId: string): Promise<void> {
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) return;

    if (room.device1 === deviceId) {
      room.device1 = null;
    } else if (room.device2 === deviceId) {
      room.device2 = null;
    }

    if (!room.device1 && !room.device2) {
      await this.roomRepo.delete(roomId);
    } else {
      await this.roomRepo.save(room);
    }
  }
}
