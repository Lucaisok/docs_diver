import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg(new Pool({ connectionString }));

const prisma = new PrismaClient({
    adapter,
    log: ["warn", "error"],
});

const main = async () => {
    await prisma.user.upsert({
        where: {
            email: "dev@example.com",
        },
        update: {},
        create: {
            id: "dev-user-1",
            email: "dev@example.com",
            name: "Dev User",
        },
    });
};

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (error) => {
        console.error(error);
        await prisma.$disconnect();
        process.exit(1);
    });