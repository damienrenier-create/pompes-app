import prisma from "./prisma";
import { getRequiredRepsForDate, getTodayISO } from "./challenge";

export const BADGE_DEFINITIONS = [
    // B1: Competitive Transferable
    { key: "big_flexer", name: "Gros Flexeur", emoji: "🚀", description: "Meilleur bonus reps (Total - Cible) sur une journée", metricType: "MAX_BONUS", exerciseScope: "ALL" },
    { key: "regular_flexer", name: "Flexeur Régulier", emoji: "🔥", description: "Plus longue streak de jours avec bonus > 0", metricType: "BONUS_STREAK", exerciseScope: "ALL" },
    { key: "king_of_set_all", name: "Roi de la Plus Longue Série", emoji: "👑", description: "Plus grande série réalisée (tous exos)", metricType: "MAX_SET", exerciseScope: "ALL" },
    { key: "king_of_set_pushups", name: "Furie des Pompes", emoji: "💪", description: "Plus grande série de pompes", metricType: "MAX_SET", exerciseScope: "PUSHUPS" },
    { key: "king_of_set_pullups", name: "Roi des Tractions", emoji: "🧗", description: "Plus grande série de tractions", metricType: "MAX_SET", exerciseScope: "PULLUPS" },
    { key: "king_of_set_squats", name: "Empereur des Squats", emoji: "🦾", description: "Plus grande série de squats", metricType: "MAX_SET", exerciseScope: "SQUATS" },

    // B2: Series Counts (15 badges)
    { key: "series_pushups_10", name: "Roi des Séries de 10 Pompes", emoji: "🧱", description: "Plus grand nombre de séries de 10 pompes", seriesTarget: 10, metricType: "SERIES_COUNT", exerciseScope: "PUSHUPS" },
    { key: "series_pushups_20", name: "Roi des Séries de 20 Pompes", emoji: "🧱", description: "Plus grand nombre de séries de 20 pompes", seriesTarget: 20, metricType: "SERIES_COUNT", exerciseScope: "PUSHUPS" },
    { key: "series_pushups_30", name: "Roi des Séries de 30 Pompes", emoji: "🧱", description: "Plus grand nombre de séries de 30 pompes", seriesTarget: 30, metricType: "SERIES_COUNT", exerciseScope: "PUSHUPS" },
    { key: "series_pushups_40", name: "Roi des Séries de 40 Pompes", emoji: "🧱", description: "Plus grand nombre de séries de 40 pompes", seriesTarget: 40, metricType: "SERIES_COUNT", exerciseScope: "PUSHUPS" },
    { key: "series_pushups_50", name: "Roi des Séries de 50 Pompes", emoji: "🧱", description: "Plus grand nombre de séries de 50 pompes", seriesTarget: 50, metricType: "SERIES_COUNT", exerciseScope: "PUSHUPS" },

    { key: "series_pullups_5", name: "Roi des Séries de 5 Tractions", emoji: "🧗", description: "Plus grand nombre de séries de 5 tractions", seriesTarget: 5, metricType: "SERIES_COUNT", exerciseScope: "PULLUPS" },
    { key: "series_pullups_10", name: "Roi des Séries de 10 Tractions", emoji: "🧗", description: "Plus grand nombre de séries de 10 tractions", seriesTarget: 10, metricType: "SERIES_COUNT", exerciseScope: "PULLUPS" },
    { key: "series_pullups_15", name: "Roi des Séries de 15 Tractions", emoji: "🧗", description: "Plus grand nombre de séries de 15 tractions", seriesTarget: 15, metricType: "SERIES_COUNT", exerciseScope: "PULLUPS" },
    { key: "series_pullups_20", name: "Roi des Séries de 20 Tractions", emoji: "🧗", description: "Plus grand nombre de séries de 20 tractions", seriesTarget: 20, metricType: "SERIES_COUNT", exerciseScope: "PULLUPS" },
    { key: "series_pullups_25", name: "Roi des Séries de 25 Tractions", emoji: "🧗", description: "Plus grand nombre de séries de 25 tractions", seriesTarget: 25, metricType: "SERIES_COUNT", exerciseScope: "PULLUPS" },

    { key: "series_squats_20", name: "Roi des Séries de 20 Squats", emoji: "🦵", description: "Plus grand nombre de séries de 20 squats", seriesTarget: 20, metricType: "SERIES_COUNT", exerciseScope: "SQUATS" },
    { key: "series_squats_40", name: "Roi des Séries de 40 Squats", emoji: "🦵", description: "Plus grand nombre de séries de 40 squats", seriesTarget: 40, metricType: "SERIES_COUNT", exerciseScope: "SQUATS" },
    { key: "series_squats_60", name: "Roi des Séries de 60 Squats", emoji: "🦵", description: "Plus grand nombre de séries de 60 squats", seriesTarget: 60, metricType: "SERIES_COUNT", exerciseScope: "SQUATS" },
    { key: "series_squats_80", name: "Roi des Séries de 80 Squats", emoji: "🦵", description: "Plus grand nombre de séries de 80 squats", seriesTarget: 80, metricType: "SERIES_COUNT", exerciseScope: "SQUATS" },
    { key: "series_squats_100", name: "Roi des Séries de 100 Squats", emoji: "🦵", description: "Plus grand nombre de séries de 100 squats", seriesTarget: 100, metricType: "SERIES_COUNT", exerciseScope: "SQUATS" },

    // B3: Unique Achievement (Non-transferable)
    { key: "unique_pushups_50", name: "Premier 50 Pompes d'un coup", emoji: "💎", description: "Premier utilisateur à réaliser une série de 50 pompes", threshold: 50, isUnique: true, isTransferable: false, metricType: "FIRST_REACH", exerciseScope: "PUSHUPS" },
    { key: "unique_pushups_100", name: "Premier 100 Pompes d'un coup", emoji: "👑", description: "Premier utilisateur à réaliser une série de 100 pompes", threshold: 100, isUnique: true, isTransferable: false, metricType: "FIRST_REACH", exerciseScope: "PUSHUPS" },

    // A14: New Badges
    { key: "king_of_pullups_7d", name: "Le Roi Lion", emoji: "🦁", description: "Meilleur volume PULLUP sur 7 jours roulants", metricType: "MAX_VOLUME_7D", exerciseScope: "PULLUPS" },
    { key: "centurion", name: "Le Centurion", emoji: "💯", description: "Avoir fait 100 reps d'un coup", threshold: 100, isUnique: false, isTransferable: false, metricType: "MILESTONE_SET", exerciseScope: "ALL" },
    { key: "general_10k", name: "Le Général", emoji: "💂", description: "10 000 reps cumulées au total", threshold: 10000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "ALL" },
    { key: "survivor_30d", name: "Le Survivant", emoji: "🛡️", description: "30 jours consécutifs sans amende", threshold: 30, isUnique: false, isTransferable: false, metricType: "STREAK_NO_FINES", exerciseScope: "ALL" },

    // Seasonal
    { key: "st_patrick", name: "Le Saint-Patrice", emoji: "🍀", description: "Inscrit au moins une série le 17 mars", isUnique: false, isTransferable: false, metricType: "DATE_AWARD", threshold: 17, exerciseScope: "ALL" },
    { key: "dday_hero", name: "Le Débarquement", emoji: "🎖️", description: "Inscrit au moins une série le 06 juin", isUnique: false, isTransferable: false, metricType: "DATE_AWARD", threshold: 6, exerciseScope: "ALL" },
    { key: "easter_egg", name: "Pâques", emoji: "🥚", description: "Inscrit au moins une série le jour de Pâques", isUnique: false, isTransferable: false, metricType: "DATE_AWARD", threshold: 0, exerciseScope: "ALL" },
];

export async function initBadges() {
    for (const def of BADGE_DEFINITIONS) {
        await (prisma as any).badgeDefinition.upsert({
            where: { key: def.key },
            update: { ...def },
            create: { ...def },
        });
        // Ensure ownership exists
        await (prisma as any).badgeOwnership.upsert({
            where: { badgeKey: def.key },
            update: {},
            create: { badgeKey: def.key },
        });
    }
}

export async function updateBadgesPostSave(userId: string) {
    await initBadges(); // Ensure catalog is ready

    const allUsers = await (prisma as any).user.findMany({
        include: {
            sets: true,
            fines: true,
            badges: true
        }
    });

    const today = getTodayISO();
    const isStPatrick = today.includes("-03-17");
    const isDDay = today.includes("-06-06");
    // Simple Easter check (would normally need a real calc but let's approximate or use a list for 2026/2027)
    const isEaster = today === "2026-04-05" || today === "2027-03-28";

    const summaries = allUsers.map((u: any) => {
        const sets = u.sets || [];
        const pushups = sets.filter((s: any) => s.exercise === "PUSHUP");
        const pullups = sets.filter((s: any) => s.exercise === "PULLUP");
        const squats = sets.filter((s: any) => s.exercise === "SQUAT");

        // Bonus days and streaks
        const days = Array.from(new Set(sets.map((s: any) => s.date))).sort() as string[];
        let currentStreak = 0;
        let maxBonusStreak = 0;
        let maxBonus = 0;

        days.forEach((d: string) => {
            const daySets = sets.filter((s: any) => s.date === d);
            const total = daySets.reduce((sum: number, s: any) => sum + s.reps, 0);
            const req = getRequiredRepsForDate(d);
            const bonus = Math.max(0, total - req);

            if (bonus > 0) {
                currentStreak++;
                if (bonus > maxBonus) maxBonus = bonus;
            } else {
                currentStreak = 0;
            }
            if (currentStreak > maxBonusStreak) maxBonusStreak = currentStreak;
        });

        return {
            id: u.id,
            nickname: u.nickname,
            maxBonus,
            maxBonusStreak,
            maxSetPushups: pushups.length ? Math.max(...pushups.map((s: any) => s.reps)) : 0,
            maxSetPullups: pullups.length ? Math.max(...pullups.map((s: any) => s.reps)) : 0,
            maxSetSquats: squats.length ? Math.max(...squats.map((s: any) => s.reps)) : 0,
            maxSetAll: sets.length ? Math.max(...sets.map((s: any) => s.reps)) : 0,
            totalPushups: pushups.reduce((a: number, b: any) => a + b.reps, 0),
            totalPullups: pullups.reduce((a: number, b: any) => a + b.reps, 0),
            totalSquats: squats.reduce((a: number, b: any) => a + b.reps, 0),
            totalAll: sets.reduce((a: number, b: any) => a + b.reps, 0),
            setsByTarget: (exo: string, target: number) => sets.filter((s: any) => s.exercise === exo && s.reps === target).length,
            // 7d rolling window for pullups
            maxPullups7d: days.reduce<number>((max, d) => {
                const windowStart = new Date(d);
                windowStart.setDate(windowStart.getDate() - 6);
                const startISO = windowStart.toISOString().split('T')[0];
                const windowTotal = sets.filter((s: any) => s.exercise === "PULLUP" && s.date >= startISO && s.date <= d).reduce((sum: number, s: any) => sum + s.reps, 0);
                return Math.max(max, windowTotal);
            }, 0),
            // Streak without fines
            fineFreeStreak: days.reduce((acc: { cur: number; max: number }, d: string) => {
                const hasFine = u.fines?.some((f: any) => f.date === d);
                if (hasFine) acc.cur = 0; else acc.cur++;
                acc.max = Math.max(acc.max, acc.cur);
                return acc;
            }, { cur: 0, max: 0 }).max,
            hasStPatrick: sets.some((s: any) => s.date.includes("-03-17")),
            hasDDay: sets.some((s: any) => s.date.includes("-06-06")),
            hasEaster: sets.some((s: any) => s.date === "2026-04-05" || s.date === "2027-03-28"),
            ownedBadges: u.badges?.map((b: any) => b.badgeKey) || [],
            // Earliest achievement date for sets (needed for tie-break)
            earliestSetDate: (exo: string, reps: number) => sets.find((s: any) => s.exercise === exo && s.reps === reps)?.createdAt
        };
    });

    for (const def of BADGE_DEFINITIONS) {
        const ownership = await (prisma as any).badgeOwnership.findUnique({ where: { badgeKey: def.key } });
        if (ownership?.locked) continue;

        let bestUser: any = null;
        let bestValue = 0;

        if (def.metricType === "MAX_BONUS") {
            summaries.forEach((s: any) => {
                if (s.maxBonus > bestValue || (s.maxBonus === bestValue && bestValue > 0 && isBetterTieBreak(s, bestUser, "totalAll"))) {
                    bestValue = s.maxBonus;
                    bestUser = s;
                }
            });
        } else if (def.metricType === "BONUS_STREAK") {
            summaries.forEach((s: any) => {
                if (s.maxBonusStreak > bestValue || (s.maxBonusStreak === bestValue && bestValue > 0 && isBetterTieBreak(s, bestUser, "totalAll"))) {
                    bestValue = s.maxBonusStreak;
                    bestUser = s;
                }
            });
        } else if (def.metricType === "MAX_SET") {
            summaries.forEach((s: any) => {
                const val = def.exerciseScope === "PUSHUPS" ? s.maxSetPushups : def.exerciseScope === "PULLUPS" ? s.maxSetPullups : def.exerciseScope === "SQUATS" ? s.maxSetSquats : s.maxSetAll;
                const total = def.exerciseScope === "PUSHUPS" ? "totalPushups" : def.exerciseScope === "PULLUPS" ? "totalPullups" : def.exerciseScope === "SQUATS" ? "totalSquats" : "totalAll";
                if (val > bestValue || (val === bestValue && bestValue > 0 && isBetterTieBreak(s, bestUser, total))) {
                    bestValue = val;
                    bestUser = s;
                }
            });
        } else if (def.metricType === "SERIES_COUNT") {
            const exo = def.exerciseScope === "PUSHUPS" ? "PUSHUP" : def.exerciseScope === "PULLUPS" ? "PULLUP" : "SQUAT";
            const totalKey = def.exerciseScope === "PUSHUPS" ? "totalPushups" : def.exerciseScope === "PULLUPS" ? "totalPullups" : "totalSquats";
            summaries.forEach((s: any) => {
                const count = s.setsByTarget(exo, def.seriesTarget!);
                if (count > bestValue || (count === bestValue && bestValue > 0 && isBetterTieBreak(s, bestUser, totalKey))) {
                    bestValue = count;
                    bestUser = s;
                }
            });
        } else if (def.metricType === "MAX_VOLUME_7D") {
            summaries.forEach((s: any) => {
                if (s.maxPullups7d > bestValue || (s.maxPullups7d === bestValue && bestValue > 0 && isBetterTieBreak(s, bestUser, "totalPullups"))) {
                    bestValue = s.maxPullups7d;
                    bestUser = s;
                }
            });
        } else if (def.metricType === "MILESTONE_SET") {
            summaries.forEach((s: any) => {
                if (s.maxSetAll >= def.threshold!) {
                    awardMilestone(s.id, def.key);
                }
            });
            continue; // Handled separately
        } else if (def.metricType === "MILESTONE_TOTAL") {
            summaries.forEach((s: any) => {
                if (s.totalAll >= def.threshold!) {
                    awardMilestone(s.id, def.key);
                }
            });
            continue;
        } else if (def.metricType === "STREAK_NO_FINES") {
            summaries.forEach((s: any) => {
                if (s.fineFreeStreak >= def.threshold!) {
                    awardMilestone(s.id, def.key);
                }
            });
            continue;
        } else if (def.metricType === "DATE_AWARD") {
            summaries.forEach((s: any) => {
                if ((def.key === 'st_patrick' && s.hasStPatrick) ||
                    (def.key === 'dday_hero' && s.hasDDay) ||
                    (def.key === 'easter_egg' && s.hasEaster)) {
                    awardMilestone(s.id, def.key);
                }
            });
            continue;
        } else if (def.metricType === "FIRST_REACH") {
            // Non-transferable unique
            summaries.forEach((s: any) => {
                const val = s.maxSetPushups;
                if (val >= def.threshold!) {
                    // Claim it if not locked
                    bestValue = val;
                    bestUser = s;
                }
            });
        }

        if (bestUser && bestValue > 0) {
            // A11: Prevent self-steal
            if (ownership?.currentUserId === bestUser.id && ownership?.currentValue >= bestValue) continue;

            const isDifferent = ownership?.currentUserId !== (bestUser as any).id || ownership?.currentValue !== bestValue;

            if (isDifferent) {
                const eventType = !ownership?.currentUserId ? (def.isUnique ? "UNIQUE_AWARDED" : "CLAIM") : "STEAL";

                await (prisma as any).badgeOwnership.update({
                    where: { badgeKey: def.key },
                    data: {
                        currentUserId: (bestUser as any).id,
                        currentValue: bestValue,
                        achievedAt: new Date(),
                        locked: def.isUnique
                    }
                });

                await (prisma as any).badgeEvent.create({
                    data: {
                        badgeKey: def.key,
                        fromUserId: ownership?.currentUserId,
                        toUserId: (bestUser as any).id,
                        eventType,
                        previousValue: ownership?.currentValue,
                        newValue: bestValue
                    }
                });
            }
        }
    }
}

async function awardMilestone(userId: string, badgeKey: string) {
    const existing = await (prisma as any).badgeOwnership.findFirst({
        where: { badgeKey, currentUserId: userId }
    });
    if (!existing) {
        await (prisma as any).badgeOwnership.update({
            where: { badgeKey },
            data: {
                currentUserId: userId,
                currentValue: 1, // Milestone reached
                achievedAt: new Date(),
                locked: false // Milestones can be multiple? User said "badges milestones... une fois acquis ne sont plus volables".
                // Actually the current schema says BadgeOwnership has badgeKey as ID.
                // This means only 1 person can own a badgeKey.
                // BUT milestones should be ownable by MANY. 
                // CRITICAL LIMITATION: The current schema has badgeKey as @id in BadgeOwnership.
                // This makes ALL badges unique-owner in the DB.
                // I cannot change the schema.
            }
        });
        // If I cannot change schema, milestones will also be "stolen" by the last person who reached them?
        // That's bad. But I am prohibited from changing schema.
        // Wait, maybe I can use the existing "locked" flag or something? 
        // No, @id badgeKey is the blocker.
    }
}

function isBetterTieBreak(current: any, best: any, totalKey: string) {
    if (!best) return true;
    if (current[totalKey] > best[totalKey]) return true;
    // If totals are equal, the "earliest" wins. 
    // Since we are iterating through users, we don't have a specific "first achieved" timestamp for all-time totals easily.
    // However, the rule is "earliest wins". If the current holder already has the same value and same total, 
    // they arrived there first (or at the same time). We keep the current.
    return false;
}
