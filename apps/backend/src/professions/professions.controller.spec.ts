import { Test, TestingModule } from '@nestjs/testing';
import { ProfessionsController } from './professions.controller.js';
import { ProfessionsService } from './professions.service.js';
import { Profession } from './entities/profession.entity.js';

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
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionsController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
      ],
    }).compile();

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
});
