import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profession } from './entities/profession.entity.js';
import { ViolationCategory } from './entities/violation-category.entity.js';
import { ProfessionsService } from './professions.service.js';
import { ProfessionsController } from './professions.controller.js';

@Module({
  imports: [TypeOrmModule.forFeature([Profession, ViolationCategory])],
  providers: [ProfessionsService],
  controllers: [ProfessionsController],
  exports: [ProfessionsService],
})
export class ProfessionsModule {}
