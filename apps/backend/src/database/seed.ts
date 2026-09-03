import bcrypt from 'bcryptjs';
import dataSource from './data-source.js';
import { Profession } from '../professions/entities/profession.entity.js';
import { User, UserRole } from '../auth/entities/user.entity.js';

async function seed() {
  await dataSource.initialize();

  const professionsRepo = dataSource.getRepository(Profession);
  const usersRepo = dataSource.getRepository(User);

  const professionExists = await professionsRepo.findOne({
    where: { federalCouncil: 'CFMV' },
  });
  if (professionExists) {
    console.log('Profissão "Medicina Veterinária" já existe. Pulando.');
  } else {
    const profession = professionsRepo.create({
      name: 'Medicina Veterinária',
      federalCouncil: 'CFMV',
      regionalCouncils: ['CRMV-SC'],
    });
    await professionsRepo.save(profession);
    console.log('Profissão "Medicina Veterinária" criada.');
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      'Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env antes de rodar o seed.',
    );
  }

  const adminExists = await usersRepo.findOne({ where: { email: adminEmail } });
  if (adminExists) {
    console.log('Usuário admin já existe. Pulando.');
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = usersRepo.create({
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
    });
    await usersRepo.save(admin);
    console.log(`Usuário admin (${adminEmail}) criado.`);
  }

  await dataSource.destroy();
}

seed();
