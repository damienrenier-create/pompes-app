const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
    console.log("Démarrage de la migration V3 (Progressive)...");
    try {
        // Check if there are any old DailyLog records with non-zero pushups/pullups/squats columns
        // that haven't been converted to ExerciseSets yet.
        // Query raw to avoid schema mismatch with the now-removed columns in Prisma Client.
        const logs = await prisma.$queryRaw`SELECT * FROM DailyLog`;

        for (const log of logs) {
            const { id, userId, date, pushups, pullups, squats } = log;

            const existingSets = await prisma.exerciseSet.findMany({
                where: { dailyLogId: id }
            });

            if (existingSets.length === 0) {
                const setsToCreate = [];
                if (pushups > 0) setsToCreate.push({ reps: pushups, exercise: "PUSHUP", date, userId, dailyLogId: id, position: 0 });
                if (pullups > 0) setsToCreate.push({ reps: pullups, exercise: "PULLUP", date, userId, dailyLogId: id, position: 0 });
                if (squats > 0) setsToCreate.push({ reps: squats, exercise: "SQUAT", date, userId, dailyLogId: id, position: 0 });

                if (setsToCreate.length > 0) {
                    console.log(`Conversion du log ${date} pour l'user ${userId} en séries...`);
                    await prisma.exerciseSet.createMany({ data: setsToCreate });
                }
            }
        }
        console.log("Migration terminée !");
    } catch (err) {
        console.log("Note: La migration a été ignorée ou a échoué (les colonnes sont peut-être déjà absentes). C'est normal si vous partez d'une base propre.");
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
