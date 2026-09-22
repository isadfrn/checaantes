import bcrypt from 'bcryptjs';
import dataSource from './data-source.js';
import { Profession } from '../professions/entities/profession.entity.js';
import { User, UserRole } from '../auth/entities/user.entity.js';

async function seed() {
  await dataSource.initialize();

  const professionsRepo = dataSource.getRepository(Profession);
  const usersRepo = dataSource.getRepository(User);

  const professionsToSeed: Array<Partial<Profession>> = [
    {
      name: 'Medicina Veterinária',
      federalCouncil: 'CFMV',
      regionalCouncils: ['CRMV-SC'],
    },
    { name: 'Estudante', federalCouncil: null, regionalCouncils: null },
    { name: 'Designer', federalCouncil: null, regionalCouncils: null },
  ];

  for (const data of professionsToSeed) {
    const exists = await professionsRepo.findOne({
      where: { name: data.name },
    });
    if (exists) {
      console.log(`Profissão "${data.name}" já existe. Pulando.`);
    } else {
      await professionsRepo.save(professionsRepo.create(data));
      console.log(`Profissão "${data.name}" criada.`);
    }
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
    let changed = false;
    if (!adminExists.emailConfirmed) {
      adminExists.emailConfirmed = true;
      changed = true;
    }
    if (!adminExists.name) {
      adminExists.name = 'Administrador';
      changed = true;
    }
    if (!adminExists.state) {
      adminExists.state = 'SC';
      changed = true;
    }
    if (changed) {
      await usersRepo.save(adminExists);
      console.log('Usuário admin já existia — atualizado (confirmado/perfil).');
    } else {
      console.log('Usuário admin já existe. Pulando.');
    }
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const admin = usersRepo.create({
      name: 'Administrador',
      email: adminEmail,
      phone: '00000000000',
      state: 'SC',
      passwordHash,
      role: UserRole.ADMIN,
      emailConfirmed: true,
    });
    await usersRepo.save(admin);
    console.log(`Usuário admin (${adminEmail}) criado.`);
  }

  await dataSource.destroy();
}

seed();
