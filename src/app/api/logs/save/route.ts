import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAllowedEncodingDates } from "@/lib/challenge";
import { BADGE_DEFINITIONS } from "@/lib/badges";
import { updateBadgesPostSave } from "@/lib/badges";
import { calculateAllUsersXP } from "@/lib/xp";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
        }

        const body = await req.json();
        const { date, sets } = body;

        if (!date || !sets) {
            return NextResponse.json({ message: "Données manquantes" }, { status: 400 });
        }

        const allowedDates = getAllowedEncodingDates();
        if (!allowedDates.includes(date)) {
            return NextResponse.json({ message: "Date non autorisée" }, { status: 403 });
        }

        const userId = session.user.id;

        // 1. Pre-calculate XP to intercept Level Up (BEFORE transaction)
        const allUsersOld = await (prisma as any).user.findMany({ include: { sets: true } });
        const badgeOwnershipsOld = await (prisma as any).badgeOwnership.findMany();
        const allXpOld = calculateAllUsersXP(allUsersOld, badgeOwnershipsOld);
        const oldXp = allXpOld.find(x => x.id === userId);

        // 2. Transaction: delete existing for this date and user, then create new
        await (prisma as any).$transaction([
            (prisma as any).exerciseSet.deleteMany({
                where: { userId, date }
            }),
            (prisma as any).exerciseSet.createMany({
                data: [
                    ...(sets.pushups || []).map((reps: number) => ({ userId, date, exercise: "PUSHUP", reps: Math.min(500, Math.max(0, Number(reps) || 0)) })),
                    ...(sets.pullups || []).map((reps: number) => ({ userId, date, exercise: "PULLUP", reps: Math.min(500, Math.max(0, Number(reps) || 0)) })),
                    ...(sets.squats || []).map((reps: number) => ({ userId, date, exercise: "SQUAT", reps: Math.min(500, Math.max(0, Number(reps) || 0)) })),
                ]
            })
        ]);

        // 3. Trigger badge calculation
        await updateBadgesPostSave(userId);

        // 4. Check for Level Up (AFTER transaction & badges)
        const allUsersNew = await (prisma as any).user.findMany({ include: { sets: true } });
        const badgeOwnershipsNew = await (prisma as any).badgeOwnership.findMany();
        const allXpNew = calculateAllUsersXP(allUsersNew, badgeOwnershipsNew);
        const newXp = allXpNew.find(x => x.id === userId);

        if (newXp && oldXp && newXp.level !== oldXp.level) {
            const isLevelUp = newXp.level > oldXp.level;
            const xpDiff = newXp.totalXP - oldXp.totalXP;

            let reasonsArr = [];

            // Calculer d'où vient précisément la différence d'XP
            if (newXp.details.rawXP !== oldXp.details.rawXP) {
                const diff = newXp.details.rawXP - oldXp.details.rawXP;
                reasonsArr.push(`un entraînement acharné (${diff > 0 ? '+' : ''}${Math.round(diff)} XP)`);
            }
            if (newXp.details.volumeBadgeXP !== oldXp.details.volumeBadgeXP) {
                const diff = newXp.details.volumeBadgeXP - oldXp.details.volumeBadgeXP;
                reasonsArr.push(`un badge débloqué (${diff > 0 ? '+' : ''}${Math.round(diff)} XP)`);
            }
            if (newXp.details.seriesBonusXP !== oldXp.details.seriesBonusXP) {
                const diff = newXp.details.seriesBonusXP - oldXp.details.seriesBonusXP;
                reasonsArr.push(`un bonus de régularité Flex (${diff > 0 ? '+' : ''}${Math.round(diff)} XP)`);
            }
            if (newXp.details.recordsXP !== oldXp.details.recordsXP) {
                const diff = newXp.details.recordsXP - oldXp.details.recordsXP;
                reasonsArr.push(`un record majestueux (${diff > 0 ? '+' : ''}${Math.round(diff)} XP)`);
            }
            if (newXp.details.finesXP !== oldXp.details.finesXP) {
                const diff = newXp.details.finesXP - oldXp.details.finesXP;
                reasonsArr.push(`une pénalité financière (${diff > 0 ? '+' : ''}${Math.round(diff)} XP)`);
            }

            const reason = reasonsArr.length > 0
                ? `grâce à : ` + reasonsArr.join(", ")
                : (isLevelUp ? `par l'opération du Saint-Esprit` : `à cause d'une modification de log`);

            await (prisma as any).badgeEvent.create({
                data: {
                    eventType: isLevelUp ? "LEVEL_UP" : "LEVEL_DOWN",
                    badgeKey: isLevelUp ? "level_up" : "level_down",
                    toUserId: userId,
                    newValue: newXp.level,
                    previousValue: oldXp.level,
                    metadata: JSON.stringify({
                        animal: newXp.animal,
                        emoji: newXp.emoji,
                        xpDiff: Math.round(xpDiff),
                        reason
                    })
                }
            });
        }

        return NextResponse.json({ message: "Séries enregistrées ✅" });

    } catch (error) {
        console.error("Save Logs Error:", error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}
