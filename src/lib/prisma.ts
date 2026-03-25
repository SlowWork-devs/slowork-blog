import { PrismaClient } from '@prisma/client';

function buildDatabaseUrlFromParts(): string | null {
  const host = process.env.DB_HOST_LANDING;
  const port = process.env.DB_PORT_LANDING ?? '5432';
  const db = process.env.DB_NAME_LANDING;
  const user = process.env.DB_USER_LANDING;
  const pass = process.env.DB_PASS_LANDING;
  const ssl = process.env.DB_SSL_LANDING === 'true';

  if (!host || !db || !user || !pass) return null;

  const base = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${db}`;
  return ssl ? `${base}?sslmode=require` : base;
}

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

if (!process.env.DATABASE_URL) {
  const url = buildDatabaseUrlFromParts();
  if (url) process.env.DATABASE_URL = url;
}

export const prisma =
  globalThis.__prisma__ ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma__ = prisma;
}

