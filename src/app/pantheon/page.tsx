import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import PantheonClient from "@/app/pantheon/PantheonClient";
import { BADGE_DEFINITIONS } from "@/lib/badges";
import { getRequiredRepsForDate } from "@/lib/challenge";

export default async function PantheonPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");

    const userId = session.user.id;

    // Fetch all necessary data in parallel
    const [
        allUsers,
        badgeOwnerships,
        allEvents,
        badgeDefinitions,
    ] = await Promise.all([
        (prisma as any).user.findMany({
            include: {
                sets: { orderBy: { createdAt: 'desc' } },
                fines: true,
                badges: { include: { badge: true } }
            }
        }),
        (prisma as any).badgeOwnership.findMany({
            include: {
                currentUser: true,
                badge: true,
            }
        }),
        (prisma as any).badgeEvent.findMany({
            take: 20,
            orderBy: { createdAt: "desc" },
            include: {
                badge: true,
                fromUser: true,
                toUser: true,
            },
        }),
        (prisma as any).badgeDefinition.findMany(),
    ]);

    // Calculate virtual milestones for everyone
    const virtualizedData = allUsers.map((u: any) => {
        const sets = u.sets || [];
        const maxSetAll = sets.length ? Math.max(...sets.map((s: any) => s.reps)) : 0;
        const totalAll = sets.reduce((sum: number, s: any) => sum + s.reps, 0);

        // Streak without fines
        const days = Array.from(new Set(sets.map((s: any) => s.date))).sort() as string[];
        const fineFreeStreak = days.reduce((acc: { cur: number; max: number }, d: string) => {
            const hasFine = u.fines?.some((f: any) => f.date === d);
            if (hasFine) acc.cur = 0; else acc.cur++;
            acc.max = Math.max(acc.max, acc.cur);
            return acc;
        }, { cur: 0, max: 0 }).max;

        return {
            userId: u.id,
            nickname: u.nickname,
            virtualBadges: {
                centurion: maxSetAll >= 100,
                general_10k: totalAll >= 10000,
                survivor_30d: fineFreeStreak >= 30,
                early_bird: sets.some((s: any) => new Date(s.createdAt).getHours() < 6),
                night_owl: sets.some((s: any) => new Date(s.createdAt).getHours() >= 22),
                high_noon: sets.some((s: any) => {
                    const dt = new Date(s.createdAt);
                    return dt.getHours() === 12 && dt.getMinutes() === 0;
                }),
                master_thief: allEvents.filter((e: any) => e.eventType === 'STEAL' && e.toUserId === u.id).length
            }
        };
    });

    // Calculate Danger List (Badges close to being stolen)
    // For simplicity, we filter competitive badges and check diffs
    const dangerList = badgeOwnerships
        .filter((bo: any) => bo.badge?.type === "COMPETITIVE" && bo.currentUserId)
        .map((bo: any) => {
            const def = BADGE_DEFINITIONS.find(d => d.key === bo.badgeKey);
            if (!def) return null;

            let bestChallenger: any = null;
            let maxVal = 0;

            allUsers.forEach((u: any) => {
                if (u.id === bo.currentUserId) return;
                let val = 0;
                const sets = u.sets || [];
                if (def.metricType === "MAX_SET") {
                    val = sets.length ? Math.max(...sets.map((s: any) => s.reps)) : 0;
                } else if (def.metricType === "MAX_BONUS") {
                    // Approximate or logic from badges.ts
                }
                if (val > maxVal) {
                    maxVal = val;
                    bestChallenger = u;
                }
            });

            const diff = bo.currentValue - maxVal;
            if (diff <= 5 && diff >= 0) {
                return {
                    badgeKey: bo.badgeKey,
                    badgeName: bo.badge?.name,
                    holder: bo.currentUser?.nickname,
                    challenger: bestChallenger?.nickname || "Inconnu",
                    diff
                };
            }
            return null;
        })
        .filter(Boolean);

    return (
        <PantheonClient
            currentUser={allUsers.find((u: any) => u.id === userId)}
            allUsers={allUsers.map((u: any) => ({ id: u.id, nickname: u.nickname }))}
            badgeDefinitions={BADGE_DEFINITIONS}
            badgeOwnerships={badgeOwnerships}
            recentEvents={allEvents}
            virtualizedData={virtualizedData}
            dangerList={dangerList as any}
        />
    );
}
