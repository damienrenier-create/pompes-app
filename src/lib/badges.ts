import prisma from "./prisma";
import { getRequiredRepsForDate, getTodayISO } from "./challenge";

export const BADGE_DEFINITIONS = [
    // B1: Competitive Transferable
    { key: "big_flexer", name: "Gros Flexeur", emoji: "🚀", description: "Meilleur bonus reps (Total - Cible) sur une journée", metricType: "MAX_BONUS", exerciseScope: "ALL", type: "COMPETITIVE" },
    { key: "regular_flexer", name: "Flexeur Régulier", emoji: "🔥", description: "Plus longue streak de jours avec bonus > 0", metricType: "BONUS_STREAK", exerciseScope: "ALL", type: "COMPETITIVE" },
    { key: "perfect_soldier", name: "Le bon petit nazi", emoji: "👨🏻", description: "Celui qui fait exactement le bon nombre de reps chaque jour. Tie-break: plus longue streak.", metricType: "PERFECT_TARGET_STREAK", exerciseScope: "ALL", type: "COMPETITIVE" },
    { key: "king_of_set_all", name: "Roi de la Plus Longue Série", emoji: "👑", description: "Plus grande série réalisée (tous exos)", metricType: "MAX_SET", exerciseScope: "ALL", type: "COMPETITIVE" },
    { key: "king_of_set_pushups", name: "Furie des Pompes", emoji: "💪", description: "Plus grande série de pompes", metricType: "MAX_SET", exerciseScope: "PUSHUPS", type: "COMPETITIVE" },
    { key: "king_of_set_pullups", name: "Roi des Tractions", emoji: "🧗", description: "Plus grande série de tractions", metricType: "MAX_SET", exerciseScope: "PULLUPS", type: "COMPETITIVE" },
    { key: "king_of_set_squats", name: "Empereur des Squats", emoji: "🦾", description: "Plus grande série de squats", metricType: "MAX_SET", exerciseScope: "SQUATS", type: "COMPETITIVE" },
    { key: "master_thief", name: "Meilleur Voleur", emoji: "🦝", description: "Celui qui a volé le plus de badges aux autres", metricType: "STEAL_COUNT", exerciseScope: "ALL", type: "COMPETITIVE" },
    { key: "yin_yang", name: "Le Yin et le Yang", emoji: "☯️", description: "Équilibre Pompes/Squats le plus proche de 100% (500 reps mini cumulées)", metricType: "BALANCE_RATIO", exerciseScope: "ALL", type: "COMPETITIVE" },
    { key: "mono_maniac", name: "Le Mono-Maniaque", emoji: "🎯", description: "Plus longue streak d'un seul exercice par jour", metricType: "MONO_EXO_STREAK", exerciseScope: "ALL", type: "COMPETITIVE" },
    { key: "trinity", name: "La Trinité", emoji: "🔺", description: "Plus longue streak avec au moins 30% Pompes, 30% Tractions, 30% Squats par jour", metricType: "TRI_EXO_STREAK", exerciseScope: "ALL", type: "COMPETITIVE" },
    { key: "mecene_year", name: "Mécène de l'Année", emoji: "💸", description: "Plus grand donneur à la cagnotte (amendes payées)", metricType: "TOTAL_FINES_AMOUNT", exerciseScope: "ALL", type: "COMPETITIVE" },

    // B2: Series Counts (Competitive)
    { key: "series_pushups_10", name: "Roi des Séries de 10", emoji: "🧱", description: "Plus grand nombre de séries de 10 pompes", seriesTarget: 10, metricType: "SERIES_COUNT", exerciseScope: "PUSHUPS", type: "COMPETITIVE" },
    { key: "series_pushups_20", name: "Roi des Séries de 20", emoji: "🧱", description: "Plus grand nombre de séries de 20 pompes", seriesTarget: 20, metricType: "SERIES_COUNT", exerciseScope: "PUSHUPS", type: "COMPETITIVE" },
    { key: "series_pushups_30", name: "Roi des Séries de 30", emoji: "🧱", description: "Plus grand nombre de séries de 30 pompes", seriesTarget: 30, metricType: "SERIES_COUNT", exerciseScope: "PUSHUPS", type: "COMPETITIVE" },
    { key: "series_pullups_10", name: "Roi des Séries de 10 Tractions", emoji: "🧗", description: "Plus grand nombre de séries de 10 tractions", seriesTarget: 10, metricType: "SERIES_COUNT", exerciseScope: "PULLUPS", type: "COMPETITIVE" },
    { key: "series_squats_20", name: "Roi des Séries de 20 Squats", emoji: "🦵", description: "Plus grand nombre de séries de 20 squats", seriesTarget: 20, metricType: "SERIES_COUNT", exerciseScope: "SQUATS", type: "COMPETITIVE" },
    { key: "series_squats_50", name: "Roi des Séries de 50 Squats", emoji: "🦵", description: "Plus grand nombre de séries de 50 squats", seriesTarget: 50, metricType: "SERIES_COUNT", exerciseScope: "SQUATS", type: "COMPETITIVE" },
    { key: "series_squats_100", name: "Roi des Séries de 100 Squats", emoji: "🦵", description: "Plus grand nombre de séries de 100 squats", seriesTarget: 100, metricType: "SERIES_COUNT", exerciseScope: "SQUATS", type: "COMPETITIVE" },

    // B3: Unique Achievement (Non-transferable Legendary)
    { key: "unique_pushups_50", name: "Premier 50 Pompes", emoji: "🥈", description: "Premier utilisateur à réaliser 50 pompes d'un coup", threshold: 50, isUnique: true, isTransferable: false, metricType: "FIRST_REACH", exerciseScope: "PUSHUPS", type: "LEGENDARY" },
    { key: "unique_pushups_80", name: "Premier 80 Pompes", emoji: "🥇", description: "Premier utilisateur à réaliser 80 pompes d'un coup", threshold: 80, isUnique: true, isTransferable: false, metricType: "FIRST_REACH", exerciseScope: "PUSHUPS", type: "LEGENDARY" },
    { key: "unique_pushups_100", name: "Premier 100 Pompes", emoji: "👑", description: "Premier utilisateur à réaliser 100 pompes d'un coup", threshold: 100, isUnique: true, isTransferable: false, metricType: "FIRST_REACH", exerciseScope: "PUSHUPS", type: "LEGENDARY" },
    { key: "legendary_pullups_20", name: "Premier 20 Tractions", emoji: "💎", description: "Premier utilisateur à réaliser 20 tractions strictes", threshold: 20, isUnique: true, isTransferable: false, metricType: "FIRST_REACH", exerciseScope: "PULLUPS", type: "LEGENDARY" },
    { key: "legendary_pullups_30", name: "Premier 30 Tractions", emoji: "☄️", description: "Premier utilisateur à réaliser 30 tractions strictes", threshold: 30, isUnique: true, isTransferable: false, metricType: "FIRST_REACH", exerciseScope: "PULLUPS", type: "LEGENDARY" },
    { key: "legendary_squats_150", name: "Premier 150 Squats", emoji: "🦵", description: "Premier utilisateur à réaliser 150 squats sans break", threshold: 150, isUnique: true, isTransferable: false, metricType: "FIRST_REACH", exerciseScope: "SQUATS", type: "LEGENDARY" },
    { key: "legendary_squats_300", name: "Premier 300 Squats", emoji: "🏋️", description: "Premier utilisateur à réaliser 300 squats sans break", threshold: 300, isUnique: true, isTransferable: false, metricType: "FIRST_REACH", exerciseScope: "SQUATS", type: "LEGENDARY" },

    // B4: Milestones (Individual)
    { key: "centurion", name: "Le Centurion", emoji: "💯", description: "Avoir fait 100 reps d'un coup", threshold: 100, isUnique: false, isTransferable: false, metricType: "MILESTONE_SET", exerciseScope: "ALL", type: "MILESTONE" },

    // Milestones (Totals Globaux)
    { key: "general_1k", name: "Le Soldat", emoji: "🔫", description: "1 000 reps cumulées", threshold: 1000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "general_5k", name: "Le Sergent", emoji: "🛡️", description: "5 000 reps cumulées", threshold: 5000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "general_10k", name: "Le Général", emoji: "🏰", description: "10 000 reps cumulées", threshold: 10000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "general_20k", name: "Le Warlord", emoji: "⚔️", description: "20 000 reps cumulées", threshold: 20000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "general_40k", name: "Le Conquérant", emoji: "🌍", description: "40 000 reps cumulées", threshold: 40000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "general_60k", name: "Le Demi-Dieu", emoji: "⚡", description: "60 000 reps cumulées", threshold: 60000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "general_100k", name: "L'Immortel", emoji: "🌌", description: "100 000 reps cumulées", threshold: 100000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "ALL", type: "MILESTONE" },

    // Milestones (Pompes)
    { key: "pushups_1k", name: "Pousseur Novice", emoji: "🥉", description: "1 000 Pompes cumulées", threshold: 1000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "PUSHUPS", type: "MILESTONE" },
    { key: "pushups_10k", name: "Pousseur Expert", emoji: "🥈", description: "10 000 Pompes cumulées", threshold: 10000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "PUSHUPS", type: "MILESTONE" },
    { key: "pushups_50k", name: "Dieu des Pompes", emoji: "🥇", description: "50 000 Pompes cumulées", threshold: 50000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "PUSHUPS", type: "MILESTONE" },

    // Milestones (Squats)
    { key: "squats_1k", name: "Cuisses de Poulet", emoji: "🍗", description: "1 000 Squats cumulés", threshold: 1000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "SQUATS", type: "MILESTONE" },
    { key: "squats_10k", name: "Cuisses d'Acier", emoji: "🦾", description: "10 000 Squats cumulés", threshold: 10000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "SQUATS", type: "MILESTONE" },
    { key: "squats_50k", name: "Pilier de la Terre", emoji: "🏛️", description: "50 000 Squats cumulés", threshold: 50000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "SQUATS", type: "MILESTONE" },
    { key: "squats_100k", name: "Atlas", emoji: "🌍", description: "100 000 Squats cumulés", threshold: 100000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "SQUATS", type: "MILESTONE" },

    // Milestones (Tractions)
    { key: "pullups_1k", name: "Grimpette", emoji: "🧗", description: "1 000 Tractions cumulées", threshold: 1000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "PULLUPS", type: "MILESTONE" },
    { key: "pullups_2k", name: "Alpiniste", emoji: "🏔️", description: "2 000 Tractions cumulées", threshold: 2000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "PULLUPS", type: "MILESTONE" },
    { key: "pullups_3k", name: "Singe", emoji: "🐒", description: "3 000 Tractions cumulées", threshold: 3000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "PULLUPS", type: "MILESTONE" },
    { key: "pullups_4k", name: "Gorille", emoji: "🦍", description: "4 000 Tractions cumulées", threshold: 4000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "PULLUPS", type: "MILESTONE" },
    { key: "pullups_5k", name: "Tarzan", emoji: "🌴", description: "5 000 Tractions cumulées", threshold: 5000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "PULLUPS", type: "MILESTONE" },
    { key: "pullups_10k", name: "Spiderman", emoji: "🕷️", description: "10 000 Tractions cumulées", threshold: 10000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "PULLUPS", type: "MILESTONE" },
    { key: "pullups_20k", name: "Maître de la Gravité", emoji: "🛸", description: "20 000 Tractions cumulées", threshold: 20000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "PULLUPS", type: "MILESTONE" },
    { key: "pullups_50k", name: "Lévitation", emoji: "🧞", description: "50 000 Tractions cumulées", threshold: 50000, isUnique: false, isTransferable: false, metricType: "MILESTONE_TOTAL", exerciseScope: "PULLUPS", type: "MILESTONE" },

    // Milestones (Survivant)
    { key: "survivor_15d", name: "Promeneur", emoji: "🚶", description: "15 jours sans amende", threshold: 15, isUnique: false, isTransferable: false, metricType: "STREAK_NO_FINES", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "survivor_30d", name: "Le Survivant", emoji: "🛡️", description: "30 jours sans amende", threshold: 30, isUnique: false, isTransferable: false, metricType: "STREAK_NO_FINES", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "survivor_60d", name: "L'Intouchable", emoji: "👻", description: "60 jours sans amende", threshold: 60, isUnique: false, isTransferable: false, metricType: "STREAK_NO_FINES", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "survivor_90d", name: "Le Fantôme", emoji: "🥷", description: "90 jours sans amende", threshold: 90, isUnique: false, isTransferable: false, metricType: "STREAK_NO_FINES", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "survivor_120d", name: "Le Saint", emoji: "👼", description: "120 jours sans amende", threshold: 120, isUnique: false, isTransferable: false, metricType: "STREAK_NO_FINES", exerciseScope: "ALL", type: "MILESTONE" },

    // Milestones (Amendes) - Mécène
    { key: "mecene_50", name: "Le Bon Samaritain", emoji: "😇", description: "50€ d'amendes payées", threshold: 50, isUnique: false, isTransferable: false, metricType: "FINES_AMOUNT", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "mecene_100", name: "Sponsor Officiel", emoji: "💰", description: "100€ d'amendes payées", threshold: 100, isUnique: false, isTransferable: false, metricType: "FINES_AMOUNT", exerciseScope: "ALL", type: "MILESTONE" },

    // Milestones (Heures) - Lève-tôt (Avant 6h)
    { key: "early_bird_1", name: "Lève-tôt (1j)", emoji: "🌅", description: "Série avant 6h du matin", isUnique: false, isTransferable: false, metricType: "TIME_AWARD", threshold: 1, type: "MILESTONE", exerciseScope: "ALL" },
    { key: "early_bird_3", name: "Lève-tôt (3j)", emoji: "🐓", description: "3 j. consécutifs avant 6h", isUnique: false, isTransferable: false, metricType: "TIME_AWARD", threshold: 3, type: "MILESTONE", exerciseScope: "ALL" },
    { key: "early_bird_7", name: "Lève-tôt (7j)", emoji: "☀️", description: "7 j. consécutifs avant 6h", isUnique: false, isTransferable: false, metricType: "TIME_AWARD", threshold: 7, type: "MILESTONE", exerciseScope: "ALL" },
    { key: "early_bird_30", name: "Lève-tôt (30j)", emoji: "🌞", description: "30 j. consécutifs avant 6h", isUnique: false, isTransferable: false, metricType: "TIME_AWARD", threshold: 30, type: "MILESTONE", exerciseScope: "ALL" },

    // Milestones (Heures) - Oiseau de Nuit (Après 22h)
    { key: "night_owl_1", name: "Oiseau de Nuit (1j)", emoji: "🦉", description: "Série après 22h", isUnique: false, isTransferable: false, metricType: "TIME_AWARD_LATE", threshold: 1, type: "MILESTONE", exerciseScope: "ALL" },
    { key: "night_owl_3", name: "Oiseau de Nuit (3j)", emoji: "🦇", description: "3 j. consécutifs après 22h", isUnique: false, isTransferable: false, metricType: "TIME_AWARD_LATE", threshold: 3, type: "MILESTONE", exerciseScope: "ALL" },
    { key: "night_owl_7", name: "Oiseau de Nuit (7j)", emoji: "🌙", description: "7 j. consécutifs après 22h", isUnique: false, isTransferable: false, metricType: "TIME_AWARD_LATE", threshold: 7, type: "MILESTONE", exerciseScope: "ALL" },
    { key: "night_owl_30", name: "Oiseau de Nuit (30j)", emoji: "🧛", description: "30 j. consécutifs après 22h", isUnique: false, isTransferable: false, metricType: "TIME_AWARD_LATE", threshold: 30, type: "MILESTONE", exerciseScope: "ALL" },

    { key: "high_noon", name: "Midi Pile", emoji: "🕛", description: "Série à 12:00 pile", isUnique: false, isTransferable: false, metricType: "TIME_AWARD_EXACT", threshold: 1, type: "MILESTONE", exerciseScope: "ALL" },

    // Milestones (Heures) - Sprinter (Premier de la journée à atteindre la cible)
    { key: "sprinter_1", name: "Le Bip-Bip", emoji: "🏃", description: "Premier à valider sa cible journalière", threshold: 1, isUnique: false, isTransferable: false, metricType: "SPRINTER_COUNT", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "sprinter_5", name: "Lièvre Rapide", emoji: "🐇", description: "5 fois premier à valider", threshold: 5, isUnique: false, isTransferable: false, metricType: "SPRINTER_COUNT", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "sprinter_10", name: "Éclair", emoji: "⚡", description: "10 fois premier à valider", threshold: 10, isUnique: false, isTransferable: false, metricType: "SPRINTER_COUNT", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "sprinter_30", name: "Sur Vitesse", emoji: "🏍️", description: "30 fois premier à valider", threshold: 30, isUnique: false, isTransferable: false, metricType: "SPRINTER_COUNT", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "sprinter_50", name: "Fusée", emoji: "🚀", description: "50 fois premier à valider", threshold: 50, isUnique: false, isTransferable: false, metricType: "SPRINTER_COUNT", exerciseScope: "ALL", type: "MILESTONE" },
    { key: "sprinter_100", name: "Téléporté", emoji: "☄️", description: "100 fois premier à valider", threshold: 100, isUnique: false, isTransferable: false, metricType: "SPRINTER_COUNT", exerciseScope: "ALL", type: "MILESTONE" },

    // Seasonal / Events
    { key: "level_up", name: "Montée de Niveau", emoji: "⭐", description: "Est passé au niveau supérieur", isUnique: false, isTransferable: false, metricType: "LEVEL_UP", threshold: 0, type: "EVENT", exerciseScope: "ALL" },
    { key: "st_patrick", name: "La Saint-Patrick", emoji: "🍀", description: "S'être entraîné le 17 mars", isUnique: false, isTransferable: false, metricType: "DATE_AWARD_HARD", threshold: 17, type: "EVENT", exerciseScope: "ALL" },
    { key: "st_patrick_gold", name: "Saint-Patrick (Or)", emoji: "🏵️", description: "Avoir validé son objectif complet le 17 mars", isUnique: false, isTransferable: false, metricType: "DATE_AWARD_HARD_GOLD", threshold: 17, type: "EVENT", exerciseScope: "ALL" },
    { key: "dday_hero", name: "Le Débarquement", emoji: "🎖️", description: "Avoir fait au moins une série le 06 juin", isUnique: false, isTransferable: false, metricType: "DATE_AWARD_HARD", threshold: 6, type: "EVENT", exerciseScope: "ALL" },
    { key: "easter_egg", name: "Pâques", emoji: "🥚", description: "Avoir fait au moins une série le jour de Pâques", isUnique: false, isTransferable: false, metricType: "DATE_AWARD_HARD", threshold: 0, type: "EVENT", exerciseScope: "ALL" },
    { key: "st_marvin", name: "Saint Marvin", emoji: "🔥", description: "Avoir égalé ou battu EMBI le 08 Mars", isUnique: false, isTransferable: false, metricType: "MARVIN_AWARD", threshold: 8, type: "EVENT", exerciseScope: "ALL" },
    { key: "st_damien", name: "Saint Damien", emoji: "⚔️", description: "Fêter la Saint Damien (18 Décembre)", isUnique: false, isTransferable: false, metricType: "DATE_AWARD", threshold: 18, type: "EVENT", exerciseScope: "ALL" },
    { key: "st_nicolas", name: "Saint Nicolas", emoji: "🍊", description: "Fêter la Saint Nicolas (06 Décembre)", isUnique: false, isTransferable: false, metricType: "DATE_AWARD", threshold: 6, type: "EVENT", exerciseScope: "ALL" },
    { key: "april_fools_1", name: "Mégalo-Carcharodon", emoji: "🦈", description: "Top 1 volume du 1er avril", isUnique: false, isTransferable: false, metricType: "APRIL_FOOLS_TIER", threshold: 1, exerciseScope: "ALL", type: "EVENT" },
    { key: "april_fools_2", name: "Gros Brochet", emoji: "🐊", description: "Top 2 volume du 1er avril", isUnique: false, isTransferable: false, metricType: "APRIL_FOOLS_TIER", threshold: 2, exerciseScope: "ALL", type: "EVENT" },
    { key: "april_fools_3", name: "Saumon Agile", emoji: "🎏", description: "Top 3 volume du 1er avril", isUnique: false, isTransferable: false, metricType: "APRIL_FOOLS_TIER", threshold: 3, exerciseScope: "ALL", type: "EVENT" },
    { key: "april_fools_4", name: "Truite Commune", emoji: "🐟", description: "Top 4 volume du 1er avril", isUnique: false, isTransferable: false, metricType: "APRIL_FOOLS_TIER", threshold: 4, exerciseScope: "ALL", type: "EVENT" },
    { key: "april_fools_5", name: "Petit Gardon", emoji: "🐡", description: "Top 5 volume du 1er avril", isUnique: false, isTransferable: false, metricType: "APRIL_FOOLS_TIER", threshold: 5, exerciseScope: "ALL", type: "EVENT" },
    { key: "april_fools_6", name: "Minuscule Sardine", emoji: "🐠", description: "Top 6 (ou pire) du 1er avril", isUnique: false, isTransferable: false, metricType: "APRIL_FOOLS_TIER", threshold: 6, exerciseScope: "ALL", type: "EVENT" },
];

export async function initBadges() {
    for (const def of BADGE_DEFINITIONS) {
        const { type, ...dbDef } = def as any;
        await (prisma as any).badgeDefinition.upsert({
            where: { key: dbDef.key },
            update: { ...dbDef },
            create: { ...dbDef },
        });
        await (prisma as any).badgeOwnership.upsert({
            where: { badgeKey: dbDef.key },
            update: {},
            create: { badgeKey: dbDef.key },
        });
    }
}

export function getUserSummaries(allUsers: any[], allEvents: any[]) {
    // 1. Calculate global sprinter stats (First to reach daily target)
    const allDays = Array.from(new Set(allUsers.flatMap(u => (u.sets || []).map((s: any) => s.date)))).sort() as string[];
    const sprinterCounts: Record<string, number> = {};
    allUsers.forEach(u => sprinterCounts[u.id] = 0);

    allDays.forEach(date => {
        const req = getRequiredRepsForDate(date);
        if (req <= 0) return;

        let earliestTime = Infinity;
        let winnerId: string | null = null;

        allUsers.forEach(u => {
            const daySets = (u.sets || []).filter((s: { date: string, createdAt: Date }) => s.date === date)
                .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            let sum = 0;
            for (const s of daySets) {
                sum += s.reps;
                if (sum >= req) {
                    const time = new Date(s.createdAt).getTime();
                    if (time < earliestTime) {
                        earliestTime = time;
                        winnerId = u.id;
                    }
                    break;
                }
            }
        });

        if (winnerId) {
            sprinterCounts[winnerId]++;
        }
    });

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
        let monoExoStreak = 0;
        let maxMonoExoStreak = 0;
        let triExoStreak = 0;
        let maxTriExoStreak = 0;

        days.forEach((d: string) => {
            const daySets = sets.filter((s: any) => s.date === d);
            const total = daySets.reduce((sum: number, s: any) => sum + s.reps, 0);
            const req = getRequiredRepsForDate(d);
            const bonus = total - req;

            const dayPushups = daySets.filter((s: any) => s.exercise === "PUSHUP").reduce((sum: number, s: any) => sum + s.reps, 0);
            const dayPullups = daySets.filter((s: any) => s.exercise === "PULLUP").reduce((sum: number, s: any) => sum + s.reps, 0);
            const daySquats = daySets.filter((s: any) => s.exercise === "SQUAT").reduce((sum: number, s: any) => sum + s.reps, 0);

            let activeExos = 0;
            if (dayPushups > 0) activeExos++;
            if (dayPullups > 0) activeExos++;
            if (daySquats > 0) activeExos++;

            if (activeExos === 1) {
                monoExoStreak++;
                if (monoExoStreak > maxMonoExoStreak) maxMonoExoStreak = monoExoStreak;
            } else { monoExoStreak = 0; }

            if (total > 0 && dayPushups >= 0.3 * total && dayPullups >= 0.3 * total && daySquats >= 0.3 * total) {
                triExoStreak++;
                if (triExoStreak > maxTriExoStreak) maxTriExoStreak = triExoStreak;
            } else { triExoStreak = 0; }

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

        // Fines (Only paid ones for Mécène badges)
        const paidFines = u.fines ? u.fines.filter((f: any) => f.status === 'paid') : [];
        const totalFinesAmount = paidFines.reduce((sum: number, f: any) => sum + (f.amountEur || 2), 0);

        const totalPushups = pushups.reduce((a: number, b: any) => a + b.reps, 0);
        const totalPullups = pullups.reduce((a: number, b: any) => a + b.reps, 0);
        const totalSquats = squats.reduce((a: number, b: any) => a + b.reps, 0);
        const totalAll = sets.reduce((a: number, b: any) => a + b.reps, 0);

        let balanceRatio = 0;
        if (totalPushups + totalSquats >= 500 && totalPushups > 0 && totalSquats > 0) {
            balanceRatio = Math.floor((Math.min(totalPushups, totalSquats) / Math.max(totalPushups, totalSquats)) * 100);
        }

        return {
            id: u.id,
            nickname: u.nickname,
            maxBonus,
            maxBonusStreak,
            maxPerfectStreak,
            stealCount,
            maxMonoExoStreak,
            maxTriExoStreak,
            balanceRatio,
            maxSetPushups: pushups.length ? Math.max(...pushups.map((s: any) => s.reps)) : 0,
            maxSetPullups: pullups.length ? Math.max(...pullups.map((s: any) => s.reps)) : 0,
            maxSetSquats: squats.length ? Math.max(...squats.map((s: any) => s.reps)) : 0,
            maxSetAll: sets.length ? Math.max(...sets.map((s: any) => s.reps)) : 0,
            totalFinesAmount,
            totalPushups,
            totalPullups,
            totalSquats,
            totalAll,
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
            hasStPatrickGold: () => {
                const target = "2026-03-17";
                const daySets = sets.filter((s: any) => s.date === target);
                const total = daySets.reduce((sum: number, s: any) => sum + s.reps, 0);
                return total >= getRequiredRepsForDate(target);
            },
            getMarvinReps: () => {
                const target = "2026-03-08";
                const daySets = sets.filter((s: any) => s.date === target);
                return daySets.reduce((sum: number, s: any) => sum + s.reps, 0);
            },
            hasStDamien: sets.some((s: any) => s.date.endsWith("-12-18")),
            hasStNicolas: sets.some((s: any) => s.date.endsWith("-12-06")),
            fineFreeStreak: days.reduce((acc: { cur: number; max: number }, d: string) => {
                const hasFine = u.fines?.some((f: any) => f.date === d);
                if (hasFine) acc.cur = 0; else acc.cur++;
                acc.max = Math.max(acc.max, acc.cur);
                return acc;
            }, { cur: 0, max: 0 }).max,
            sprinterCount: sprinterCounts[u.id] || 0,
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
        } else if (def.metricType === "BALANCE_RATIO") {
            summaries.forEach((s: any) => {
                if (s.balanceRatio > bestValue || (s.balanceRatio === bestValue && bestValue > 0 && isBetterTieBreak(s, bestUser, "totalAll"))) {
                    bestValue = s.balanceRatio; bestUser = s;
                }
            });
        } else if (def.metricType === "MONO_EXO_STREAK") {
            summaries.forEach((s: any) => {
                if (s.maxMonoExoStreak > bestValue || (s.maxMonoExoStreak === bestValue && bestValue > 0 && isBetterTieBreak(s, bestUser, "totalAll"))) {
                    bestValue = s.maxMonoExoStreak; bestUser = s;
                }
            });
        } else if (def.metricType === "TRI_EXO_STREAK") {
            summaries.forEach((s: any) => {
                if (s.maxTriExoStreak > bestValue || (s.maxTriExoStreak === bestValue && bestValue > 0 && isBetterTieBreak(s, bestUser, "totalAll"))) {
                    bestValue = s.maxTriExoStreak; bestUser = s;
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
            const scopeField = def.exerciseScope === "PUSHUPS" ? "totalPushups" : def.exerciseScope === "PULLUPS" ? "totalPullups" : def.exerciseScope === "SQUATS" ? "totalSquats" : "totalAll";
            await Promise.all(summaries.map((s: any) => s[scopeField] >= def.threshold! ? awardMilestone(s.id, def.key, 1) : Promise.resolve()));
            continue;
        } else if (def.metricType === "FINES_AMOUNT") {
            await Promise.all(summaries.map((s: any) => s.totalFinesAmount >= def.threshold! ? awardMilestone(s.id, def.key, 1) : Promise.resolve()));
            continue;
        } else if (def.metricType === "TOTAL_FINES_AMOUNT") {
            summaries.forEach((s: any) => {
                if (s.totalFinesAmount > bestValue) {
                    bestValue = s.totalFinesAmount; bestUser = s;
                }
            });
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
        } else if (def.metricType === "SPRINTER_COUNT") {
            await Promise.all(summaries.map((s: any) => s.sprinterCount >= def.threshold! ? awardMilestone(s.id, def.key, 1) : Promise.resolve()));
            continue;
        } else if (def.metricType === "DATE_AWARD_HARD") {
            const dateMap: any = { 'st_patrick': '-03-17', 'dday_hero': '-06-06', 'easter_egg': '2026-04-05' };
            await Promise.all(summaries.map((s: any) => {
                const target = dateMap[def.key];
                return s.checkDatePlayed(target) ? awardMilestone(s.id, def.key, 1) : Promise.resolve();
            }));
            continue;
        } else if (def.metricType === "DATE_AWARD_HARD_GOLD") {
            if (def.key === "st_patrick_gold") {
                await Promise.all(summaries.map((s: any) => s.hasStPatrickGold() ? awardMilestone(s.id, def.key, 1) : Promise.resolve()));
            }
            continue;
        } else if (def.metricType === "MARVIN_AWARD") {
            const embi = summaries.find((u: any) => u.nickname.toLowerCase() === 'embi');
            const embiReps = embi ? embi.getMarvinReps() : 0;
            // Only award if EMBI has reps, and others have >= EMBI reps (including EMBI himself)
            if (embiReps > 0) {
                await Promise.all(summaries.map((s: any) => s.getMarvinReps() >= embiReps ? awardMilestone(s.id, def.key, 1) : Promise.resolve()));
            }
            continue;
        } else if (def.metricType === "DATE_AWARD") {
            await Promise.all(summaries.map((s: any) => {
                const isAwarded = (def.key === 'st_damien' && s.hasStDamien) || (def.key === 'st_nicolas' && s.hasStNicolas);
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
                    if (def.key === "april_fools_1") {
                        await awardMilestone(dayScores[0].id, def.key, dayScores[0].todayReps);
                    } else if (def.key === "april_fools_2" && dayScores.length > 1) {
                        await awardMilestone(dayScores[1].id, def.key, dayScores[1].todayReps);
                    } else if (def.key === "april_fools_3" && dayScores.length > 2) {
                        await awardMilestone(dayScores[2].id, def.key, dayScores[2].todayReps);
                    } else if (def.key === "april_fools_4" && dayScores.length > 3) {
                        await awardMilestone(dayScores[3].id, def.key, dayScores[3].todayReps);
                    } else if (def.key === "april_fools_5" && dayScores.length > 4) {
                        await awardMilestone(dayScores[4].id, def.key, dayScores[4].todayReps);
                    } else if (def.key === "april_fools_6" && dayScores.length > 5) {
                        // All others from rank 6 below get the lowest badge
                        const lowestPromises = [];
                        for (let i = 5; i < dayScores.length; i++) {
                            lowestPromises.push(awardMilestone(dayScores[i].id, def.key, dayScores[i].todayReps));
                        }
                        await Promise.all(lowestPromises);
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
