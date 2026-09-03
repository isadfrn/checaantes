import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ProfessionsService } from './professions.service.js';
import { Profession } from './entities/profession.entity.js';

@Controller('professions')
export class ProfessionsController {
  constructor(private readonly professionsService: ProfessionsService) {}

  @Get()
  findAll(): Promise<Profession[]> {
    return this.professionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Profession> {
    return this.professionsService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Profession>): Promise<Profession> {
    return this.professionsService.create(data);
  }
}
