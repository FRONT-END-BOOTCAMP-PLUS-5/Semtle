import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const koreanMathUnits = [
  '자연수',
  '정수',
  '유리수',
  '소인수분해',
  '제곱근',
  '실수',
  '소수',
  '분수',
  '최대공약수',
  '최소공배수',
];

async function createBasicTestUsers() {
  const basicUsers = [
    { userId: '1', password: 'test-password', role: 'student', name: '학생' },
    { userId: '2', password: 'test-password', role: 'teacher', name: '선생님' },
    { userId: '3', password: 'test-password', role: 'admin', name: '관리자' },
  ];

  for (const userData of basicUsers) {
    const user = await prisma.user.findFirst({
      where: { userId: userData.userId },
    });

    if (!user) {
      const hashed = await bcrypt.hash(userData.password, 12);
      await prisma.user.create({
        data: {
          userId: userData.userId,
          password: hashed,
          name: userData.name,
          role: userData.role,
        },
      });
    } else if (!user.password.startsWith('$2')) {
      const hashed = await bcrypt.hash(userData.password, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      });
    }
  }

  console.log(
    '✓ Created/verified basic test users (1/student, 2/teacher, 3/admin)'
  );
}

async function main() {
  console.log('Starting seed...');

  // Create units (idempotent - only create if not exists)
  for (const unitName of koreanMathUnits) {
    const existingUnit = await prisma.unit.findFirst({
      where: { name: unitName },
    });

    if (!existingUnit) {
      await prisma.unit.create({
        data: {
          name: unitName,
          vidUrl: `https://example.com/videos/${encodeURIComponent(unitName)}`,
        },
      });
    }
  }

  console.log(`✓ Created/verified ${koreanMathUnits.length} units`);

  // Create basic test users with different roles
  await createBasicTestUsers();

  // Get all units for solve generation
  const units = await prisma.unit.findMany();

  // Get or create a test user
  let testUser = await prisma.user.findFirst({
    where: { userId: 'test-user' },
  });

  if (!testUser) {
    const hashed = await bcrypt.hash('test-password', 12);
    testUser = await prisma.user.create({
      data: {
        userId: 'test-user',
        password: hashed,
        name: '테스트 사용자',
        role: 'student',
      },
    });
  } else if (!testUser.password.startsWith('$2')) {
    // Ensure existing seed user has hashed password
    const hashed = await bcrypt.hash('test-password', 12);
    testUser = await prisma.user.update({
      where: { id: testUser.id },
      data: { password: hashed },
    });
  }

  console.log('✓ Created/verified test user');

  // Check if we already have solve data
  const existingSolvesCount = await prisma.solve.count();
  if (existingSolvesCount > 0) {
    console.log(`✓ Seed data already exists (${existingSolvesCount} solves)`);
    return;
  }

  // Generate solve data over the last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const sampleQuestions = [
    '다음을 계산하세요: (-3) + 5',
    '다음을 계산하세요: 8 - 12',
    '다음을 계산하세요: (-4) × 7',
    '다음을 계산하세요: 36 ÷ (-9)',
    '√16의 값은?',
    '√49의 값은?',
    '다음을 계산하세요: 2.5 + 3.7',
    '다음을 계산하세요: 7.2 - 4.8',
    '다음을 계산하세요: 0.3 × 0.4',
    '다음을 계산하세요: 4.8 ÷ 1.2',
  ];

  const answers = ['2', '-4', '-28', '-4', '4', '7', '6.2', '2.4', '0.12', '4'];

  // Generate ~200 solves distributed over 30 days
  const solvesToCreate = [];
  for (let i = 0; i < 200; i++) {
    const randomUnit = units[Math.floor(Math.random() * units.length)];
    const questionIndex = Math.floor(Math.random() * sampleQuestions.length);

    // Random date in the last 30 days
    const randomDate = new Date(
      thirtyDaysAgo.getTime() +
        Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
    );

    // Mix of correct/incorrect answers (70% correct)
    const isCorrect = Math.random() < 0.7;
    const userInput = isCorrect ? answers[questionIndex] : '잘못된 답';

    solvesToCreate.push({
      question: sampleQuestions[questionIndex],
      answer: answers[questionIndex],
      helpText: `${randomUnit.name} 단원의 문제입니다. 차근차근 풀어보세요.`,
      userInput,
      isCorrect,
      createdAt: randomDate,
      unitId: randomUnit.id,
      userId: testUser.id,
    });
  }

  // Batch create solves
  await prisma.solve.createMany({
    data: solvesToCreate,
    skipDuplicates: true,
  });

  console.log(`✓ Created ${solvesToCreate.length} solve records`);
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
