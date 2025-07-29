// prisma/seed.ts
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password,
      name: 'Admin User',
    },
  });
}

main()
  .then(() => {
    console.log('Seed complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
