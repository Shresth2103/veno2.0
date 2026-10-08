const prisma = require('../src/config/db');

async function seedRooms() {
  console.log('🌱 Seeding rooms...');
  const rooms = [
    // FLOOR 2 
    { roomNumber: 'AB1 209', capacity: 8, floor: 2, roomType: 'TECH' },
    { roomNumber: 'AB1 210', capacity: 7, floor: 2, roomType: 'TECH' },
    { roomNumber: 'AB1 211', capacity: 6, floor: 2, roomType: 'NON_TECH' },
    { roomNumber: 'AB1 217', capacity: 9, floor: 2, roomType: 'NON_TECH' },
    { roomNumber: 'AB1 225', capacity: 8, floor: 2, roomType: 'NON_TECH' },
  
    // FLOOR 3 
    { roomNumber: 'AB1 311', capacity: 8, floor: 3, roomType: 'TECH' },
    { roomNumber: 'AB1 312', capacity: 7, floor: 3, roomType: 'TECH' },
    { roomNumber: 'AB1 319', capacity: 6, floor: 3, roomType: 'NON_TECH' },
    { roomNumber: 'AB1 320', capacity: 9, floor: 3, roomType: 'NON_TECH' },
  ];

  await prisma.room.createMany({
    data: rooms,
    skipDuplicates: true,
  });

  const floor2Rooms = rooms.filter(r => r.floor === 2);
  const floor3Rooms = rooms.filter(r => r.floor === 3);
  const techRooms = rooms.filter(r => r.roomType === 'TECH');
  const nonTechRooms = rooms.filter(r => r.roomType === 'NON_TECH');

  console.log('✅ Rooms seeded successfully!');
  console.log(`Total rooms: ${rooms.length}`);
  console.log(`\n📍 Floor 2 (${floor2Rooms.length} rooms): ${floor2Rooms.map(r => r.roomNumber).join(', ')}`);
  console.log(`📍 Floor 3 (${floor3Rooms.length} rooms): ${floor3Rooms.map(r => r.roomNumber).join(', ')}`);
  console.log(`\n  - TECH rooms (${techRooms.length}): ${techRooms.map(r => r.roomNumber).join(', ')}`);
  console.log(`  - NON-TECH rooms (${nonTechRooms.length}): ${nonTechRooms.map(r => r.roomNumber).join(', ')}`);
  console.log(`\nTotal capacity: ${rooms.reduce((sum, r) => sum + r.capacity, 0)} teams`);
}

if (require.main === module) {
  seedRooms()
    .catch((e) => {
      console.error('❌ Error seeding rooms:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = seedRooms;
