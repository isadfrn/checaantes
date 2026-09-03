import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profession } from './entities/profession.entity.js';

@Injectable()
export class ProfessionsService {
  constructor(
    @InjectRepository(Profession)
    private professionRepository: Repository<Profession>,
  ) {}

  async findAll(): Promise<Profession[]> {
    return this.professionRepository.find();
  }

  async findOne(id: string): Promise<Profession> {
    const profession = await this.professionRepository.findOne({
      where: { id },
      relations: { violationCategories: true },
    });

    if (!profession) {
      throw new NotFoundException(`Profissão ${id} não encontrada`);
    }

    return profession;
  }

  create(data: Partial<Profession>): Promise<Profession> {
    const profession = this.professionRepository.create(data);
    return this.professionRepository.save(profession);
  }
}
