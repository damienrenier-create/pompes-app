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
    { key: "early_bird", name: "Lève-tôt", emoji: "🌅", description: "Jours consécutifs avec une série avant 6h du matin", isUnique: false, isTransferable: false, metricType: "TIME_AWARD", threshold: 1, type: "MILESTONE" },
    { key: "night_owl", name: "Oiseau de Nuit", emoji: "🦉", description: "Jours consécutifs avec une série après 22h", isUnique: false, isTransferable: false, metricType: "TIME_AWARD_LATE", threshold: 1, type: "MILESTONE" },
    { key: "high_noon", name: "Midi Pile", emoji: "🕛", description: "Jours consécutifs avec une série à 12:00 pile", isUnique: false, isTransferable: false, metricType: "TIME_AWARD_EXACT", threshold: 1, type: "MILESTONE" },

    // Seasonal / Events
    { key: "st_patrick", name: "Le Saint-Patrice", emoji: "🍀", description: "Avoir fait au moins une série le 17 mars", isUnique: false, isTransferable: false, metricType: "DATE_AWARD_HARD", threshold: 17, type: "EVENT" },
    { key: "dday_hero", name: "Le Débarquement", emoji: "🎖️", description: "Avoir fait au moins une série le 06 juin", isUnique: false, isTransferable: false, metricType: "DATE_AWARD_HARD", threshold: 6, type: "EVENT" },
    { key: "easter_egg", name: "Pâques", emoji: "🥚", description: "Avoir fait au moins une série le jour de Pâques", isUnique: false, isTransferable: false, metricType: "DATE_AWARD_HARD", threshold: 0, type: "EVENT" },
    { key: "st_marvin", name: "Saint Marvin", emoji: "🔥", description: "Fêter la Saint Marvin (08 Mars)", isUnique: false, isTransferable: false, metricType: "DATE_AWARD", threshold: 8, type: "EVENT" },
    { key: "st_damien", name: "Saint Damien", emoji: "⚔️", description: "Fêter la Saint Damien (18 Décembre)", isUnique: false, isTransferable: false, metricType: "DATE_AWARD", threshold: 18, type: "EVENT" },
    { key: "st_nicolas", name: "Saint Nicolas", emoji: "🍊", description: "Fêter la Saint Nicolas (06 Décembre)", isUnique: false, isTransferable: false, metricType: "DATE_AWARD", threshold: 6, type: "EVENT" },
    { key: "april_fools_gros", name: "Gros Poisson", emoji: "🦈", description: "1er volume du 1er avril", isUnique: false, isTransferable: false, metricType: "APRIL_FOOLS_TIER", exerciseScope: "ALL", type: "EVENT" },
    { key: "april_fools_moyen", name: "Poisson d'Avril", emoji: "🐟", description: "Volume moyen du 1er avril", isUnique: false, isTransferable: false, metricType: "APRIL_FOOLS_TIER", exerciseScope: "ALL", type: "EVENT" },
    { key: "april_fools_petit", name: "Petite Sardine", emoji: "🐠", description: "Dernier volume du 1er avril", isUnique: false, isTransferable: false, metricType: "APRIL_FOOLS_TIER", exerciseScope: "ALL", type: "EVENT" },
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
            // Time awards (Evolutive Streaks)
            earlyStreak: days.reduce((acc: { cur: number; max: number }, d: string) => {
                const daySets = sets.filter((s: any) => s.date === d);
                if (daySets.some((s: any) => new Date(s.createdAt).getHours() < 6)) acc.cur++; else acc.cur = 0;
                acc.max = Math.max(acc.max, acc.cur);
                return acc;
            }, { cur: 0, max: 0 }).max,
            lateStreak: days.reduce((acc: { cur: number; max: number }, d: string) => {
                const daySets = sets.filter((s: any) => s.date === d);
                if (daySets.some((s: any) => new Date(s.createdAt).getHours() >= 22)) acc.cur++; else acc.cur = 0;
                acc.max = Math.max(acc.max, acc.cur);
                return acc;
            }, { cur: 0, max: 0 }).max,
            noonStreak: days.reduce((acc: { cur: number; max: number }, d: string) => {
                const daySets = sets.filter((s: any) => s.date === d);
                if (daySets.some((s: any) => {
                    const dt = new Date(s.createdAt);
                    return dt.getHours() === 12 && dt.getMinutes() === 0;
                })) acc.cur++; else acc.cur = 0;
                acc.max = Math.max(acc.max, acc.cur);
                return acc;
            }, { cur: 0, max: 0 }).max,

            // Date awards (Soft conditions now)
            checkDatePlayed: (dateStr: string) => {
                const target = dateStr.startsWith('-') ? "2026" + dateStr : dateStr;
                const daySets = sets.filter((s: any) => s.date === target);
                return daySets.length > 0;
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

    const [allUsers, steals] = await Promise.all([
        (prisma as any).user.findMany({ where: { nickname: { not: 'modo' } }, include: { sets: true, fines: true, badges: true } }),
        (prisma as any).badgeEvent.findMany({ where: { eventType: "STEAL" } })
    ]);

    const summaries = getUserSummaries(allUsers, steals);

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
            await Promise.all(summaries.map((s: any) => s.maxSetAll >= def.threshold! ? awardMilestone(s.id, def.key, 1) : Promise.resolve()));
            continue;
        } else if (def.metricType === "MILESTONE_TOTAL") {
            await Promise.all(summaries.map((s: any) => s.totalAll >= def.threshold! ? awardMilestone(s.id, def.key, 1) : Promise.resolve()));
            continue;
        } else if (def.metricType === "TIME_AWARD") {
            await Promise.all(summaries.map((s: any) => s.earlyStreak >= (def.threshold || 1) ? awardMilestone(s.id, def.key, s.earlyStreak) : Promise.resolve()));
            continue;
        } else if (def.metricType === "TIME_AWARD_LATE") {
            await Promise.all(summaries.map((s: any) => s.lateStreak >= (def.threshold || 1) ? awardMilestone(s.id, def.key, s.lateStreak) : Promise.resolve()));
            continue;
        } else if (def.metricType === "TIME_AWARD_EXACT") {
            await Promise.all(summaries.map((s: any) => s.noonStreak >= (def.threshold || 1) ? awardMilestone(s.id, def.key, s.noonStreak) : Promise.resolve()));
            continue;
        } else if (def.metricType === "STREAK_NO_FINES") {
            await Promise.all(summaries.map((s: any) => s.fineFreeStreak >= def.threshold! ? awardMilestone(s.id, def.key, s.fineFreeStreak) : Promise.resolve()));
            continue;
        } else if (def.metricType === "DATE_AWARD_HARD") {
            const dateMap: any = { 'st_patrick': '-03-17', 'dday_hero': '-06-06', 'easter_egg': '2026-04-05' };
            await Promise.all(summaries.map((s: any) => {
                const target = dateMap[def.key];
                return s.checkDatePlayed(target) ? awardMilestone(s.id, def.key, 1) : Promise.resolve();
            }));
            continue;
        } else if (def.metricType === "DATE_AWARD") {
            await Promise.all(summaries.map((s: any) => {
                const isAwarded = (def.key === 'st_marvin' && s.hasStMarvin) || (def.key === 'st_damien' && s.hasStDamien) || (def.key === 'st_nicolas' && s.hasStNicolas);
                return isAwarded ? awardMilestone(s.id, def.key, 1) : Promise.resolve();
            }));
            continue;
        } else if (def.metricType === "APRIL_FOOLS_TIER") {
            // Evaluated explicitly on April 1st.
            const todayISO = getTodayISO();
            if (todayISO.endsWith("-04-01")) {
                const dayScores = summaries.map((s: any) => {
                    const todaySets = s.sets?.filter((s2: any) => s2.date === todayISO) || [];
                    const todayReps = todaySets.reduce((sum: number, s2: any) => sum + s2.reps, 0);
                    return { id: s.id, todayReps };
                }).filter(x => x.todayReps > 0).sort((a: any, b: any) => b.todayReps - a.todayReps);

                if (dayScores.length > 0) {
                    if (def.key === "april_fools_gros") {
                        await awardMilestone(dayScores[0].id, def.key, dayScores[0].todayReps);
                    } else if (def.key === "april_fools_petit" && dayScores.length > 1) {
                        await awardMilestone(dayScores[dayScores.length - 1].id, def.key, dayScores[dayScores.length - 1].todayReps);
                    } else if (def.key === "april_fools_moyen" && dayScores.length > 2) {
                        const midPromises = [];
                        for (let i = 1; i < dayScores.length - 1; i++) {
                            midPromises.push(awardMilestone(dayScores[i].id, def.key, dayScores[i].todayReps));
                        }
                        await Promise.all(midPromises);
                    }
                }
            }
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

async function awardMilestone(userId: string, badgeKey: string, value: number = 1) {
    // Only use Event table as a high-watermark for milestones since Ownership is strictly 1-to-1 unique
    const existingEvents = await (prisma as any).badgeEvent.findMany({
        where: { badgeKey, toUserId: userId },
        orderBy: { newValue: 'desc' }
    });
    const maxValue = existingEvents[0]?.newValue || 0;

    if (value > maxValue) {
        await (prisma as any).badgeEvent.create({
            data: { badgeKey, fromUserId: null, toUserId: userId, eventType: "UNIQUE_AWARDED", previousValue: maxValue, newValue: value }
        });
    }
}

function isBetterTieBreak(current: any, best: any, totalKey: string) {
    if (!best) return true;
    if (current[totalKey] > best[totalKey]) return true;
    return false;
}
