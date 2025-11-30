import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const usersWithoutProfile = await prisma.user.findMany({
    where: {
      profile: null,
    },
  });

  for (const user of usersWithoutProfile) {
    try {
      const profile = await prisma.profile.create({
        data: {
          name: user.email.split('@')[0],
          userId: user.id,
          tokensBalance: 30,
        },
      });

      console.log(`Profile criado: ${profile.id} para ${user.email}`);
    } catch (error) {
      console.error(`Erro ao criar profile para ${user.email}:`, error);
    }
  }

  console.log('Migração concluída');
}

main()
  .catch((e) => {
    console.error('Erro na migração:', e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
