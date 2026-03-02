import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BADGE_DEFINITIONS } from "@/lib/badges";
import TrophiesClient from "./TrophiesClient";

export default async function TrophiesPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const userId = session.user.id;

    // Fetch user stats
    const sets = await prisma.exerciseSet.findMany({
        where: { userId },
    });

    const stats = {
        totalPushups: sets.filter(s => s.exercise === "PUSHUP").reduce((acc, s) => acc + s.reps, 0),
        totalPullups: sets.filter(s => s.exercise === "PULLUP").reduce((acc, s) => acc + s.reps, 0),
        totalSquats: sets.filter(s => s.exercise === "SQUAT").reduce((acc, s) => acc + s.reps, 0),
        totalAll: sets.reduce((acc, s) => acc + s.reps, 0),
        maxSetAll: sets.length > 0 ? Math.max(...sets.map(s => s.reps)) : 0,
    };

    // Fetch earned badges
    const earnedBadges = await prisma.badgeOwnership.findMany({
        where: { currentUserId: userId },
        select: { badgeKey: true },
    });

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-12 pb-20">
            <header className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic">
                        La Salle des <span className="text-indigo-500">Trophées</span>
                    </h1>
                    <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
                        Ta collection personnelle d'exploits et d'objectifs.
                    </p>
                </div>
                <Link
                    href="/"
                    className="w-full sm:w-auto px-6 py-3 text-xs font-black uppercase tracking-widest text-white bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all border border-slate-700 shadow-xl text-center"
                >
                    ← Dashboard
                </Link>
            </header>

            <TrophiesClient
                earnedBadges={earnedBadges.map(b => b.badgeKey)}
                badgeDefinitions={BADGE_DEFINITIONS as any}
                userStats={stats}
            />
        </div>
    );
}
