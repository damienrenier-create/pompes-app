import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import PantheonClient from "@/app/pantheon/PantheonClient";
import { BADGE_DEFINITIONS, getUserSummaries } from "@/lib/badges";
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
                sets: true,
                fines: true,
            }
        }),
        (prisma as any).badgeOwnership.findMany({
            include: {
                currentUser: true,
                badge: true,
            }
        }),
        (prisma as any).badgeEvent.findMany({
            take: 30,
            orderBy: { createdAt: "desc" },
            include: {
                badge: true,
                fromUser: true,
                toUser: true,
            },
        }),
        (prisma as any).badgeDefinition.findMany(),
    ]);

    const summaries = getUserSummaries(allUsers, allEvents);

    // Calculate virtual milestones for everyone
    const virtualizedData = summaries.map((s: any) => {
        return {
            userId: s.id,
            nickname: s.nickname,
            virtualBadges: {
                centurion: s.maxSetAll >= 100,
                general_10k: s.totalAll >= 10000,
                survivor_30d: s.fineFreeStreak >= 30,
                early_bird: s.hasEarly,
                night_owl: s.hasLate,
                high_noon: s.hasNoon,
                master_thief: s.stealCount
            }
        };
    });

    // Calculate Danger List (Badges close to being stolen)
    const dangerList = badgeOwnerships
        .filter((bo: any) => bo.badge?.type === "COMPETITIVE" && bo.currentUserId && bo.currentValue > 0)
        .map((bo: any) => {
            const def = BADGE_DEFINITIONS.find(d => d.key === bo.badgeKey);
            if (!def) return null;

            // Metric keys mapping
            const metricMap: any = {
                "MAX_BONUS": "maxBonus",
                "BONUS_STREAK": "maxBonusStreak",
                "PERFECT_TARGET_STREAK": "maxPerfectStreak",
                "STEAL_COUNT": "stealCount"
            };

            let valKey = metricMap[def.metricType];
            if (def.metricType === "MAX_SET") {
                valKey = def.exerciseScope === "PUSHUPS" ? "maxSetPushups" : def.exerciseScope === "PULLUPS" ? "maxSetPullups" : def.exerciseScope === "SQUATS" ? "maxSetSquats" : "maxSetAll";
            } else if (def.metricType === "SERIES_COUNT") {
                // Approximate for danger list
                valKey = "maxSetAll";
            }

            if (!valKey) return null;

            // Find best challenger (excluding current holder)
            const sortedChallengers = summaries
                .filter(s => s.id !== bo.currentUserId)
                .sort((a: any, b: any) => b[valKey] - a[valKey]);

            const challenger = sortedChallengers[0] as any;
            if (!challenger) return null;

            const challengerValue = challenger[valKey];
            const diff = bo.currentValue - challengerValue;

            // Show if diff is small (e.g., within 10% or absolute small range)
            const percentClose = (challengerValue / bo.currentValue);

            if (percentClose >= 0.8 || diff <= 5) {
                return {
                    badgeKey: bo.badgeKey,
                    badgeName: bo.badge?.name,
                    emoji: bo.badge?.emoji,
                    holder: bo.currentUser?.nickname,
                    challenger: challenger.nickname,
                    currentValue: bo.currentValue,
                    challengerValue,
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
