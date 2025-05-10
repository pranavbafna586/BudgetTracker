import { PrismaClient } from "@/lib/generated/prisma";

// Use more robust initialization with better error handling
const prismaClientSingleton = () => {
  try {
    return new PrismaClient();
  } catch (error) {
    console.error("Failed to initialize Prisma Client:", error);
    throw error;
  }
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Use this workaround to avoid multiple instances during development
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
