import { PrismaClient } from '@prisma/client';

import { encrypt } from '../lib/crypto';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { employeeId: '00XX00' },
    update: {},
    create: {
      employeeId: '00XX00',
      name: 'Admin User',
      password: encrypt('M0nd4y$44'),
      role: 'ADMIN'
    }
  });
}
main()
  .then(() => prisma.$disconnect())
  .catch(async _ => {
    await prisma.$disconnect();
    process.exit(1);
  });
