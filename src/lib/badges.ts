import prisma from "./prisma";
import { getRequiredRepsForDate, getTodayISO } from "./challenge";

export const BADGE_DEFINITIONS = [
    // B1: Competitive Transferable
    { key: "big_flexer", name: "Gros Flexeur", emoji: "🚀", description: "Meilleur bonus reps (Total - Cible) sur une journée", metricType: "MAX_BONUS", exerciseScope: "ALL", type: "COMPETITIVE" },
    { key: "regular_flexer", name: "Flexeur Régulier", emoji: "🔥", description: "Plus longue streak de jours avec bonus > 0", metricType: "BONUS_STREAK", exerciseScope: "ALL", type: "COMPETITIVE" },
    { key: "perfect_soldier", name: "Le bon petit nazi", emoji: "📏", description: "Celui qui fait exactement le bon nombre de reps chaque jour. Tie-break: plus longue streak.", metricType: "PERFECT_TARGET_STREAK", exerciseScope: "ALL", type: "COMPETITIVE" },
    { key: "king_of_set_all", name: "Roi de la Plus Longue Série", emoji: "👑", description: "Plus grande série réalisée (tous exos)", metricType: "MAX_SET", exerciseScope: "ALL", type: "COMPETITIVE" },
    { key: "king_of_set_pushups", name: "Furie des Pompes", emoji: "💪", description: "Plus grande série de pompes", metricType: "MAX_SET", exerciseScope: "PUSHUPS", type: "COMPETITIVE" },
    { key: "king_of_set_pullups", name: "Roi des Tractions", emoji: "🧗", description: "Plus grande série de tractions", metricType: "MAX_SET", exerciseScope: "PULLUPS", type: "COMPETITIVE" },
    { key: "king_of_set_squats", name: "Empereur des Squats", emoji: "🦾", description: "Plus grande série de squats", metricType: "MAX_SET", exerciseScope: "SQUATS", type: "COMPETITIVE" },
    { key: "master_thief", name: "Meilleur Voleur", emoji: "🦝", description: "Celui qui a volé le plus de badges aux autres", metricType: "STEAL_COUNT", exerciseScope: "ALL", type: "COMPETITIVE" },

    // B2: Series Counts (Competitive)
    { key: "series_pushups_10", name: "Roi des Séries de 10", emoji: "🧱", description: "Plus grand nombre de séries de 10 pompes", seriesTarget: 10, metricType: "SERIES_COUNT", exerciseScope: "PUSHUPS", type: "COMPETITIVE" },
    { key: "series_pushups_20", name: "Roi des Séries de 20", emoji: "🧱", description: "Plus grand nombre de séries de 20 pompes", seriesTarget: 20, metricType: "SERIES_COUNT", exerciseScope: "PUSHUPS", type: "COMPETITIVE" },
    { key: "series_pushups_30", name: "Roi des Séries de 30", emoji: "🧱", description: "Plus grand nombre de séries de 30 pompes", seriesTarget: 30, metricType: "SERIES_COUNT", exerciseScope: "PUSHUPS", type: "COMPETITIVE" },
    { key: "series_pullups_10", name: "Roi des Séries de 10 Tractions", emoji: "🧗", description: "Plus grand nombre de séries de 10 tractions", seriesTarget: 10, metricType: "SERIES_COUNT", exerciseScope: "PULLUPS", type: "COMPETITIVE" },

    // B3: Unique Achievement (Non-transferable Legendary)
    { key: "unique_pushups_100", name: "Premier 100 Pompes", emoji: "👑", description: "Premier utilisateur à réaliser 100 pompes d'un coup", threshold: 100, isUnique: true, isTransferable: false, metricType: "FIRST_REACH", exerciseScope: "PUSHUPS", type: "LEGENDARY" },
    { key: "legendary_pullups_20", name: "Premier 20 Tractions", emoji: "💎", description: "Premier utilisateur à réaliser 20 tractions strictes", threshold: 20, isUnique: true, isTransferable: false, metricType: "FIRST_REACH", exerciseScope: "PULLUPS", type: "LEGENDARY" },
    { key: "legendary_squats_150", name: "Premier 150 Squats", emoji: "🦵", description: "Premier utilisateur à réaliser 150 squats sans break", threshold: 150, isUnique: true, isTransferable: false, metricType: "FIRST_REACH", exerciseScope: "SQUATS", type: "LEGENDARY" },

    // B4: Milestones (Individual)
    { key: "centurion", name: "Le Centurion", emoji: "💯", description: "Avoir fait 100 reps d'un coup", threshold: 100, isUnique: false, isTransferable: false, metricType: "MILESTONE_SET", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "general_10k", name: "Le Général", emoji: "💂", description: "10 000 reps cumulées au total", threshold: 10000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "survivor_30d", name: "Le Survivant", emoji: "🛡️", description: "30 jours consécutifs sans amende", threshold: 30, isUnique: false, isTransferable: false, metricType: "STREAK_NO_FINES", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "early_bird", name: "Lève-tôt", emoji: "🌅", description: "Enregistrer une série avant 6h du matin", isUnique: false, isTransferable: false, metricType: "TIME_AWARD", threshold: 6, type: "MILESTONE" },
    { key: "night_owl", name: "Oiseau de Nuit", emoji: "🦉", description: "Enregistrer une série après 22h", isUnique: false, isTransferable: false, metricType: "TIME_AWARD_LATE", threshold: 22, type: "MILESTONE" },
    { key: "high_noon", name: "Midi Pile", emoji: "🕛", description: "Enregistrer une série à 12:00 pile", isUnique: false, isTransferable: false, metricType: "TIME_AWARD_EXACT", threshold: 12, type: "MILESTONE" },

    // Seasonal / Events
    { key: "st_patrick", name: "Le Saint-Patrice", emoji: "🍀", description: "Avoir fait le quota le 17 mars", isUnique: false, isTransferable: false, metricType: "DATE_AWARD_HARD", threshold: 17, type: "EVENT" },
    { key: "dday_hero", name: "Le Débarquement", emoji: "🎖️", description: "Avoir fait le quota le 06 juin", isUnique: false, isTransferable: false, metricType: "DATE_AWARD_HARD", threshold: 6, type: "EVENT" },
    { key: "easter_egg", name: "Pâques", emoji: "🥚", description: "Avoir fait le quota le jour de Pâques", isUnique: false, isTransferable: false, metricType: "DATE_AWARD_HARD", threshold: 0, type: "EVENT" },
    { key: "st_marvin", name: "Saint Marvin", emoji: "🔥", description: "Fêter la Saint Marvin (08 Mars)", isUnique: false, isTransferable: false, metricType: "DATE_AWARD", threshold: 8, type: "EVENT" },
    { key: "st_damien", name: "Saint Damien", emoji: "⚔️", description: "Fêter la Saint Damien (18 Décembre)", isUnique: false, isTransferable: false, metricType: "DATE_AWARD", threshold: 18, type: "EVENT" },
    { key: "st_nicolas", name: "Saint Nicolas", emoji: "🍊", description: "Fêter la Saint Nicolas (06 Décembre)", isUnique: false, isTransferable: false, metricType: "DATE_AWARD", threshold: 6, type: "EVENT" },
];

export async function initBadges() {
    for (const def of BADGE_DEFINITIONS) {
        await (prisma as any).badgeDefinition.upsert({
            where: { key: def.key },
            update: { ...def },
            create: { ...def },
        });
        await (prisma as any).badgeOwnership.upsert({
            where: { badgeKey: def.key },
            update: {},
            create: { badgeKey: def.key },
        });
    }
}

export function getUserSummaries(allUsers: any[], allEvents: any[]) {
    return allUsers.map((u: any) => {
        const sets = u.sets || [];
        const pushups = sets.filter((s: any) => s.exercise === "PUSHUP");
        const pullups = sets.filter((s: any) => s.exercise === "PULLUP");
        const squats = sets.filter((s: any) => s.exercise === "SQUAT");

        // Streaks & Bonus
        const days = Array.from(new Set(sets.map((s: any) => s.date))).sort() as string[];
        let currentStreak = 0;
        let maxBonusStreak = 0;
        let perfectStreak = 0;
        let maxPerfectStreak = 0;
        let maxBonus = 0;

        days.forEach((d: string) => {
            const daySets = sets.filter((s: any) => s.date === d);
            const total = daySets.reduce((sum: number, s: any) => sum + s.reps, 0);
            const req = getRequiredRepsForDate(d);
            const bonus = total - req;

            if (bonus > 0) {
                currentStreak++;
                if (bonus > maxBonus) maxBonus = bonus;
            } else { currentStreak = 0; }
            if (currentStreak > maxBonusStreak) maxBonusStreak = currentStreak;

            if (total === req && req > 0) {
                perfectStreak++;
                if (perfectStreak > maxPerfectStreak) maxPerfectStreak = perfectStreak;
            } else { perfectStreak = 0; }
        });

        // Steal count
        const stealCount = allEvents.filter((e: any) => e.toUserId === u.id).length;

        return {
            id: u.id,
            nickname: u.nickname,
            maxBonus,
            maxBonusStreak,
            maxPerfectStreak,
            stealCount,
            maxSetPushups: pushups.length ? Math.max(...pushups.map((s: any) => s.reps)) : 0,
            maxSetPullups: pullups.length ? Math.max(...pullups.map((s: any) => s.reps)) : 0,
            maxSetSquats: squats.length ? Math.max(...squats.map((s: any) => s.reps)) : 0,
            maxSetAll: sets.length ? Math.max(...sets.map((s: any) => s.reps)) : 0,
            totalPushups: pushups.reduce((a: number, b: any) => a + b.reps, 0),
            totalPullups: pullups.reduce((a: number, b: any) => a + b.reps, 0),
            totalSquats: squats.reduce((a: number, b: any) => a + b.reps, 0),
            totalAll: sets.reduce((a: number, b: any) => a + b.reps, 0),
            setsByTarget: (exo: string, target: number) => sets.filter((s: any) => s.exercise === exo && s.reps === target).length,
            // Time awards
            hasEarly: sets.some((s: any) => new Date(s.createdAt).getHours() < 6),
            hasLate: sets.some((s: any) => new Date(s.createdAt).getHours() >= 22),
            hasNoon: sets.some((s: any) => {
                const d = new Date(s.createdAt);
                return d.getHours() === 12 && d.getMinutes() === 0;
            }),
            // Date awards (Hard conditions)
            checkHardDate: (dateStr: string) => {
                const target = dateStr.startsWith('-') ? "2026" + dateStr : dateStr;
                const daySets = sets.filter((s: any) => s.date === target);
                const total = daySets.reduce((sum: number, s: any) => sum + s.reps, 0);
                return total >= getRequiredRepsForDate(target) && total > 0;
            },
            hasStMarvin: sets.some((s: any) => s.date.endsWith("-03-08")),
            hasStDamien: sets.some((s: any) => s.date.endsWith("-12-18")),
            hasStNicolas: sets.some((s: any) => s.date.endsWith("-12-06")),
            fineFreeStreak: days.reduce((acc: { cur: number; max: number }, d: string) => {
                const hasFine = u.fines?.some((f: any) => f.date === d);
                if (hasFine) acc.cur = 0; else acc.cur++;
                acc.max = Math.max(acc.max, acc.cur);
                return acc;
            }, { cur: 0, max: 0 }).max,
        };
    });
}

export async function updateBadgesPostSave(userId: string) {
    await initBadges();

    const [allUsers, allEvents] = await Promise.all([
        (prisma as any).user.findMany({ include: { sets: true, fines: true, badges: true } }),
        (prisma as any).badgeEvent.findMany({ where: { eventType: "STEAL" } })
    ]);

    const summaries = getUserSummaries(allUsers, allEvents);

    for (const def of BADGE_DEFINITIONS) {
        const ownership = await (prisma as any).badgeOwnership.findUnique({ where: { badgeKey: def.key } });
        if (ownership?.locked) continue;

        let bestUser: any = null;
        let bestValue = 0;

        if (def.metricType === "MAX_BONUS") {
            summaries.forEach((s: any) => {
                if (s.maxBonus > bestValue || (s.maxBonus === bestValue && bestValue > 0 && isBetterTieBreak(s, bestUser, "totalAll"))) {
                    bestValue = s.maxBonus; bestUser = s;
                }
            });
        } else if (def.metricType === "BONUS_STREAK") {
            summaries.forEach((s: any) => {
                if (s.maxBonusStreak > bestValue || (s.maxBonusStreak === bestValue && bestValue > 0 && isBetterTieBreak(s, bestUser, "totalAll"))) {
                    bestValue = s.maxBonusStreak; bestUser = s;
                }
            });
        } else if (def.metricType === "PERFECT_TARGET_STREAK") {
            summaries.forEach((s: any) => {
                if (s.maxPerfectStreak > bestValue || (s.maxPerfectStreak === bestValue && bestValue > 0 && isBetterTieBreak(s, bestUser, "totalAll"))) {
                    bestValue = s.maxPerfectStreak; bestUser = s;
                }
            });
        } else if (def.metricType === "STEAL_COUNT") {
            summaries.forEach((s: any) => {
                if (s.stealCount > bestValue || (s.stealCount === bestValue && bestValue > 0 && isBetterTieBreak(s, bestUser, "totalAll"))) {
                    bestValue = s.stealCount; bestUser = s;
                }
            });
        } else if (def.metricType === "MAX_SET") {
            summaries.forEach((s: any) => {
                const val = def.exerciseScope === "PUSHUPS" ? s.maxSetPushups : def.exerciseScope === "PULLUPS" ? s.maxSetPullups : def.exerciseScope === "SQUATS" ? s.maxSetSquats : s.maxSetAll;
                const totalKey = def.exerciseScope === "PUSHUPS" ? "totalPushups" : def.exerciseScope === "PULLUPS" ? "totalPullups" : def.exerciseScope === "SQUATS" ? "totalSquats" : "totalAll";
                if (val > bestValue || (val === bestValue && bestValue > 0 && isBetterTieBreak(s, bestUser, totalKey))) {
                    bestValue = val; bestUser = s;
                }
            });
        } else if (def.metricType === "SERIES_COUNT") {
            const exo = def.exerciseScope === "PUSHUPS" ? "PUSHUP" : def.exerciseScope === "PULLUPS" ? "PULLUP" : "SQUAT";
            const totalKey = def.exerciseScope === "PUSHUPS" ? "totalPushups" : def.exerciseScope === "PULLUPS" ? "totalPullups" : "totalSquats";
            summaries.forEach((s: any) => {
                const count = s.setsByTarget(exo, def.seriesTarget!);
                if (count > bestValue || (count === bestValue && bestValue > 0 && isBetterTieBreak(s, bestUser, totalKey))) {
                    bestValue = count; bestUser = s;
                }
            });
        } else if (def.metricType === "MILESTONE_SET") {
            summaries.forEach((s: any) => { if (s.maxSetAll >= def.threshold!) awardMilestone(s.id, def.key); });
            continue;
        } else if (def.metricType === "MILESTONE_TOTAL") {
            summaries.forEach((s: any) => { if (s.totalAll >= def.threshold!) awardMilestone(s.id, def.key); });
            continue;
        } else if (def.metricType === "TIME_AWARD") {
            summaries.forEach((s: any) => { if (s.hasEarly) awardMilestone(s.id, def.key); });
            continue;
        } else if (def.metricType === "TIME_AWARD_LATE") {
            summaries.forEach((s: any) => { if (s.hasLate) awardMilestone(s.id, def.key); });
            continue;
        } else if (def.metricType === "TIME_AWARD_EXACT") {
            summaries.forEach((s: any) => { if (s.hasNoon) awardMilestone(s.id, def.key); });
            continue;
        } else if (def.metricType === "STREAK_NO_FINES") {
            summaries.forEach((s: any) => { if (s.fineFreeStreak >= def.threshold!) awardMilestone(s.id, def.key); });
            continue;
        } else if (def.metricType === "DATE_AWARD_HARD") {
            const dateMap: any = { 'st_patrick': '-03-17', 'dday_hero': '-06-06', 'easter_egg': '2026-04-05' };
            summaries.forEach((s: any) => {
                const target = dateMap[def.key];
                if (s.checkHardDate(target)) awardMilestone(s.id, def.key);
            });
            continue;
        } else if (def.metricType === "DATE_AWARD") {
            summaries.forEach((s: any) => {
                if ((def.key === 'st_marvin' && s.hasStMarvin) || (def.key === 'st_damien' && s.hasStDamien) || (def.key === 'st_nicolas' && s.hasStNicolas)) {
                    awardMilestone(s.id, def.key);
                }
            });
            continue;
        } else if (def.metricType === "FIRST_REACH") {
            const scope = def.exerciseScope === "PUSHUPS" ? "maxSetPushups" : def.exerciseScope === "PULLUPS" ? "maxSetPullups" : "maxSetSquats";
            summaries.forEach((s: any) => { if (s[scope] >= def.threshold!) { bestValue = s[scope]; bestUser = s; } });
        }

        if (bestUser && bestValue > 0) {
            if (ownership?.currentUserId === bestUser.id && ownership?.currentValue >= bestValue) continue;
            const isDifferent = ownership?.currentUserId !== (bestUser as any).id || ownership?.currentValue !== bestValue;
            if (isDifferent) {
                const eventType = !ownership?.currentUserId ? (def.isUnique ? "UNIQUE_AWARDED" : "CLAIM") : "STEAL";
                await (prisma as any).badgeOwnership.update({ where: { badgeKey: def.key }, data: { currentUserId: (bestUser as any).id, currentValue: bestValue, achievedAt: new Date(), locked: def.isUnique } });
                await (prisma as any).badgeEvent.create({ data: { badgeKey: def.key, fromUserId: ownership?.currentUserId, toUserId: (bestUser as any).id, eventType, previousValue: ownership?.currentValue, newValue: bestValue } });
            }
        }
    }
}

async function awardMilestone(userId: string, badgeKey: string) {
    const existing = await (prisma as any).badgeOwnership.findFirst({ where: { badgeKey, currentUserId: userId } });
    if (!existing) {
        await (prisma as any).badgeOwnership.update({ where: { badgeKey }, data: { currentUserId: userId, currentValue: 1, achievedAt: new Date(), locked: false } });
    }
}

function isBetterTieBreak(current: any, best: any, totalKey: string) {
    if (!best) return true;
    if (current[totalKey] > best[totalKey]) return true;
    return false;
}
