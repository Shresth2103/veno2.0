const dns = require('dns');
const { PrismaClient } = require('../../generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

// Ensure resilient DNS resolution if local network DNS fails on Neon host
if (!globalThis.__dnsResolverPatched) {
  globalThis.__dnsResolverPatched = true;
  const originalLookup = dns.lookup;
  const publicResolver = new dns.Resolver();
  publicResolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

  dns.lookup = function (hostname, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }
    originalLookup(hostname, options, (err, address, family) => {
      if (!err) return callback(null, address, family);
      publicResolver.resolve4(hostname, (resErr, addresses) => {
        if (!resErr && addresses && addresses.length > 0) {
          if (options && options.all) {
            return callback(null, addresses.map((a) => ({ address: a, family: 4 })));
          }
          return callback(null, addresses[0], 4);
        }
        callback(err || resErr);
      });
    });
  };
}

function prismaClientSingleton() {
  const isLocalhost = process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1'));
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // max connections - increased for better concurrency
    min: 0,  // avoid holding connections open on serverless DB
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // 30s timeout to allow Neon serverless wake-up
    ssl: isLocalhost ? false : {
      rejectUnauthorized: false,
    },
  });

  pool.on('error', (err) => {
    console.error('Unexpected pg pool error:', err.message);
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
