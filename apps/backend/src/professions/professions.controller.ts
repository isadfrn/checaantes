import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProfessionsService } from './professions.service.js';
import { Profession } from './entities/profession.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/entities/user.entity.js';

@ApiTags('professions')
@Controller('professions')
export class ProfessionsController {
  constructor(private readonly professionsService: ProfessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as profissões (público)' })
  findAll() {
    return this.professionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha uma profissão pelo id (público)' })
  findOne(@Param('id') id: string) {
    return this.professionsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cria uma profissão (somente admin)' })
  create(@Body() data: Partial<Profession>) {
    return this.professionsService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualiza uma profissão (somente admin)' })
  update(@Param('id') id: string, @Body() data: Partial<Profession>) {
    return this.professionsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove uma profissão (somente admin)' })
  remove(@Param('id') id: string) {
    return this.professionsService.remove(id);
  }
}
