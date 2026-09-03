import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProfessionsService } from './professions.service.js';
import { Profession } from './entities/profession.entity.js';

const profession: Profession = {
  id: 'uuid-1',
  name: 'Medicina',
  federalCouncil: 'CFM',
  regionalCouncils: ['CRM-SP'],
  violationCategories: [],
};

describe('ProfessionsService', () => {
  let service: ProfessionsService;
  const professionRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionsService,
        {
          provide: getRepositoryToken(Profession),
          useValue: professionRepository,
        },
      ],
    }).compile();

    service = module.get(ProfessionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns the list from the repository', async () => {
      professionRepository.find.mockResolvedValue([profession]);

      await expect(service.findAll()).resolves.toEqual([profession]);
      expect(professionRepository.find).toHaveBeenCalledWith();
    });
  });

  describe('findOne', () => {
    it('returns the profession with violation categories', async () => {
      professionRepository.findOne.mockResolvedValue(profession);

      await expect(service.findOne(profession.id)).resolves.toEqual(profession);
      expect(professionRepository.findOne).toHaveBeenCalledWith({
        where: { id: profession.id },
        relations: { violationCategories: true },
      });
    });

    it('throws NotFoundException when the profession does not exist', async () => {
      professionRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(profession.id)).rejects.toThrow(
        new NotFoundException(`Profissão ${profession.id} não encontrada`),
      );
    });
  });

  describe('create', () => {
    it('creates and saves the profession', async () => {
      const data: Partial<Profession> = {
        name: 'Medicina',
        federalCouncil: 'CFM',
      };
      professionRepository.create.mockReturnValue(profession);
      professionRepository.save.mockResolvedValue(profession);

      await expect(service.create(data)).resolves.toEqual(profession);
      expect(professionRepository.create).toHaveBeenCalledWith(data);
      expect(professionRepository.save).toHaveBeenCalledWith(profession);
    });
  });

  describe('update', () => {
    it('updates and saves the profession', async () => {
      const data: Partial<Profession> = { name: 'Odontologia' };
      const updated = { ...profession, ...data };
      professionRepository.findOne.mockResolvedValue({ ...profession });
      professionRepository.save.mockResolvedValue(updated);

      await expect(service.update(profession.id, data)).resolves.toEqual(updated);
      expect(professionRepository.save).toHaveBeenCalledWith(updated);
    });

    it('throws NotFoundException when the profession does not exist', async () => {
      professionRepository.findOne.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('removes the profession', async () => {
      professionRepository.findOne.mockResolvedValue(profession);
      professionRepository.remove.mockResolvedValue(undefined);

      await expect(service.remove(profession.id)).resolves.toBeUndefined();
      expect(professionRepository.remove).toHaveBeenCalledWith(profession);
    });

    it('throws NotFoundException when the profession does not exist', async () => {
      professionRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
