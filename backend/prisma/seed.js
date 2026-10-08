const bcrypt = require('bcryptjs');
const prisma = require('../src/config/db');
const seedRooms = require('./seed-rooms');
const seedBoardMaps = require('./seed-maps');
const seedQuestions = require('./seed-questions');

async function main() {
  console.log('🌱 Starting database seed...\n');

  // 1. Seed Rooms
  console.log('--- 1. Seeding Rooms ---');
  await seedRooms();

  // 2. Seed Board Maps
  console.log('\n--- 2. Seeding Board Maps ---');
  await seedBoardMaps();

  // 3. Seed Questions
  console.log('\n--- 3. Seeding Questions ---');
  await seedQuestions();

  // Helper for hashing passwords
  const hashPassword = async (password) => {
    return bcrypt.hash(password, 10);
  };

  const superPasswordHash = await hashPassword('super123');
  const adminPasswordHash = await hashPassword('admin123');
  const teamPasswordHash = await hashPassword('team123');

  // 4. Create 2 Super Admins
  console.log('\n--- 4. Seeding 2 Super Admins ---');
  const superadmins = ['SUPER001', 'SUPER002'];
  for (const username of superadmins) {
    await prisma.user.upsert({
      where: { username },
      update: {
        password: superPasswordHash,
        role: 'SUPERADMIN',
      },
      create: {
        username,
        password: superPasswordHash,
        role: 'SUPERADMIN',
      },
    });
    console.log(`✅ Superadmin created/updated: ${username} (password: super123)`);
  }

  // 5. Create 10 Admins
  console.log('\n--- 5. Seeding 10 Admins ---');
  for (let i = 1; i <= 10; i++) {
    const username = `ADMIN${String(i).padStart(3, '0')}`;
    await prisma.user.upsert({
      where: { username },
      update: {
        password: adminPasswordHash,
        role: 'ADMIN',
      },
      create: {
        username,
        password: adminPasswordHash,
        role: 'ADMIN',
      },
    });
    console.log(`✅ Admin created/updated: ${username} (password: admin123)`);
  }

  // 6. Create 10 Teams and Participant Logins
  console.log('\n--- 6. Seeding 10 Participant Teams ---');
  const allMaps = await prisma.boardMap.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  const defaultMapId = allMaps.length > 0 ? allMaps[0].id : null;

  const teamNames = [
    'Team Alpha',
    'Team Bravo',
    'Team Charlie',
    'Team Delta',
    'Team Echo',
    'Team Foxtrot',
    'Team Golf',
    'Team Hotel',
    'Team India',
    'Team Juliet',
  ];

  const rooms = [
    'AB1 209', 'AB1 210', 'AB1 211', 'AB1 217', 'AB1 225',
    'AB1 311', 'AB1 312', 'AB1 319', 'AB1 320',
  ];

  for (let i = 1; i <= 10; i++) {
    const teamCode = `TEAM${String(i).padStart(3, '0')}`;
    const teamName = teamNames[i - 1];
    const assignedRoom = rooms[(i - 1) % rooms.length];
    const assignedMap = allMaps.length > 0 ? allMaps[(i - 1) % allMaps.length].id : defaultMapId;

    // Create or update Team
    const team = await prisma.team.upsert({
      where: { teamCode },
      update: {
        teamName,
        currentRoom: assignedRoom,
        mapId: assignedMap,
        status: 'ACTIVE',
        canRollDice: true,
      },
      create: {
        teamCode,
        teamName,
        currentPosition: 1,
        currentRoom: assignedRoom,
        mapId: assignedMap,
        status: 'ACTIVE',
        canRollDice: true,
        totalTimeSec: 0,
        points: 0,
      },
    });

    // Create team members
    await prisma.teamMember.upsert({
      where: { id: `member-${teamCode}-1` },
      update: { teamId: team.id, name: `${teamName} Player 1` },
      create: {
        id: `member-${teamCode}-1`,
        name: `${teamName} Player 1`,
        teamId: team.id,
      },
    });

    await prisma.teamMember.upsert({
      where: { id: `member-${teamCode}-2` },
      update: { teamId: team.id, name: `${teamName} Player 2` },
      create: {
        id: `member-${teamCode}-2`,
        name: `${teamName} Player 2`,
        teamId: team.id,
      },
    });

    // Create or update Participant User
    await prisma.user.upsert({
      where: { username: teamCode },
      update: {
        password: teamPasswordHash,
        role: 'PARTICIPANT',
        teamId: team.id,
      },
      create: {
        username: teamCode,
        password: teamPasswordHash,
        role: 'PARTICIPANT',
        teamId: team.id,
      },
    });

    console.log(`✅ Team created/updated: ${teamCode} (${teamName}) (password: team123)`);
  }

  console.log('\n🎉 Database seed completed successfully!');
}

if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((e) => {
      console.error('❌ Seed failed:', e);
      process.exit(1);
    });
}

module.exports = main;
