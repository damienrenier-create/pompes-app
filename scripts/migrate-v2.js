const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
    console.log("Démarrage de la migration V2...");
    try {
        // 1. Get all logs that haven't been migrated yet (still have old data in SQLite)
        // We use queryRaw because the Prisma Client might already be updated to the new schema
        const logs = await prisma.$queryRaw`SELECT * FROM DailyLog`;

        for (const log of logs) {
            const { id, userId, date, pushups, pullups, squats } = log;

            // Check if sets already exist to avoid double migration
            const existingSets = await prisma.exerciseSet.findMany({
                where: { dailyLogId: id }
            });

            if (existingSets.length === 0) {
                console.log(`Migration du log ${date} pour l'user ${userId}...`);

                const setsToCreate = [];
                if (pushups > 0) setsToCreate.push({ reps: pushups, exercise: "PUSHUP", date, userId, dailyLogId: id, position: 0 });
                if (pullups > 0) setsToCreate.push({ reps: pullups, exercise: "PULLUP", date, userId, dailyLogId: id, position: 0 });
                if (squats > 0) setsToCreate.push({ reps: squats, exercise: "SQUAT", date, userId, dailyLogId: id, position: 0 });

                if (setsToCreate.length > 0) {
                    await prisma.exerciseSet.createMany({
                        data: setsToCreate
                    });
                }
            }
        }
        console.log("Migration terminée avec succès !");
    } catch (err) {
        console.error("Erreur pendant la migration (les colonnes sont peut-être déjà supprimées) :", err.message);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
