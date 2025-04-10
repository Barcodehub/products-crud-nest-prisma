import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.role.createMany({
    data: [{ name: 'user' }, { name: 'admin' }],
  });
}

main();
