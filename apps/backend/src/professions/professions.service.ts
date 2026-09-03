import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profession } from './entities/profession.entity.js';

@Injectable()
export class ProfessionsService {
  constructor(
    @InjectRepository(Profession)
    private professionsRepository: Repository<Profession>,
  ) {}

  findAll(): Promise<Profession[]> {
    return this.professionsRepository.find();
  }

  async findOne(id: string): Promise<Profession> {
    const profession = await this.professionsRepository.findOne({
      where: { id },
      relations: { violationCategories: true },
    });
    if (!profession) {
      throw new NotFoundException(`Profissão ${id} não encontrada`);
    }
    return profession;
  }

  create(data: Partial<Profession>): Promise<Profession> {
    const profession = this.professionsRepository.create(data);
    return this.professionsRepository.save(profession);
  }

  async update(id: string, data: Partial<Profession>): Promise<Profession> {
    const profession = await this.findOne(id);
    Object.assign(profession, data);
    return this.professionsRepository.save(profession);
  }

  async remove(id: string): Promise<void> {
    const profession = await this.findOne(id);
    await this.professionsRepository.remove(profession);
  }
}
