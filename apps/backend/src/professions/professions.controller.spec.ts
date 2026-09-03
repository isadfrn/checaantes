import { Test, TestingModule } from '@nestjs/testing';
import { ProfessionsController } from './professions.controller.js';
import { ProfessionsService } from './professions.service.js';
import { Profession } from './entities/profession.entity.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';

const profession: Profession = {
  id: 'uuid-1',
  name: 'Medicina',
  federalCouncil: 'CFM',
  regionalCouncils: ['CRM-SP'],
  violationCategories: [],
};

describe('ProfessionsController', () => {
  let controller: ProfessionsController;
  const professionsService = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionsController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(ProfessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('delegates to the service and returns the result', async () => {
      professionsService.findAll.mockResolvedValue([profession]);

      await expect(controller.findAll()).resolves.toEqual([profession]);
      expect(professionsService.findAll).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('delegates to the service with the given id', async () => {
      professionsService.findOne.mockResolvedValue(profession);

      await expect(controller.findOne(profession.id)).resolves.toEqual(
        profession,
      );
      expect(professionsService.findOne).toHaveBeenCalledWith(profession.id);
    });
  });

  describe('create', () => {
    it('delegates to the service with the request body', async () => {
      const data: Partial<Profession> = {
        name: 'Medicina',
        federalCouncil: 'CFM',
      };
      professionsService.create.mockResolvedValue(profession);

      await expect(controller.create(data)).resolves.toEqual(profession);
      expect(professionsService.create).toHaveBeenCalledWith(data);
    });
  });

  describe('update', () => {
    it('delegates to the service with id and body', async () => {
      const data: Partial<Profession> = { name: 'Odontologia' };
      const updated = { ...profession, ...data };
      professionsService.update.mockResolvedValue(updated);

      await expect(controller.update(profession.id, data)).resolves.toEqual(updated);
      expect(professionsService.update).toHaveBeenCalledWith(profession.id, data);
    });
  });

  describe('remove', () => {
    it('delegates to the service with the given id', async () => {
      professionsService.remove.mockResolvedValue(undefined);

      await expect(controller.remove(profession.id)).resolves.toBeUndefined();
      expect(professionsService.remove).toHaveBeenCalledWith(profession.id);
    });
  });
});
