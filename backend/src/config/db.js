const { PrismaClient } = require('../../generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

function prismaClientSingleton() {
  const isLocalhost = process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1'));
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // max connections - increased for better concurrency
    min: 2,  // keep minimum connections ready
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000, // faster timeout
    ssl: isLocalhost ? false : {
      rejectUnauthorized: false,
    },
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'PRODUCTION') {
  globalThis.prismaGlobal = prisma;
}

module.exports = prisma;
