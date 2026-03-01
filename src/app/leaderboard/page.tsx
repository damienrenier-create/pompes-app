import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LeaderboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    // Query 1: Group by userId and sum reps for "PUSHUP"
    const pushupLogs = await prisma.exerciseSet.groupBy({
        by: ["userId"],
        where: {
            exercise: "PUSHUP",
        },
        _sum: {
            reps: true,
        },
    });

    // Query 2: Fetch all relevant users to get nicknames
    const users = await prisma.user.findMany({
        select: {
            id: true,
            nickname: true,
        },
    });

    const userMap = new Map(users.map((u) => [u.id, u.nickname]));

    // Combine data and sort by total reps desc
    const leaderboard = pushupLogs
        .map((log) => ({
            userId: log.userId,
            nickname: userMap.get(log.userId) || "Inconnu",
            totalReps: log._sum.reps || 0,
        }))
        .sort((a, b) => b.totalReps - a.totalReps);

    const totalGroupReps = leaderboard.reduce((sum, entry) => sum + entry.totalReps, 0);

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-12 pb-20">
            <header className="text-center space-y-4">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter italic uppercase">
                    Le Leaderboard <span className="text-indigo-500">Pushups</span>
                </h1>
                <div className="inline-flex items-center gap-3 bg-slate-900 border border-slate-800 px-6 py-2 rounded-full">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-slate-300 font-mono text-sm uppercase tracking-widest">
                        Total Collectif : <span className="text-white font-bold">{totalGroupReps.toLocaleString()}</span> REPS
                    </span>
                </div>
            </header>

            {/* Contribution Graph (HTML/CSS Only) */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">📊</span> Part des Efforts
                </h2>

                <div className="space-y-4">
                    {leaderboard.map((entry) => {
                        const percentage = totalGroupReps > 0 ? (entry.totalReps / totalGroupReps) * 100 : 0;
                        return (
                            <div key={entry.userId} className="space-y-1">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-slate-300">{entry.nickname}</span>
                                    <span className="text-indigo-400 font-mono">{percentage.toFixed(1)}%</span>
                                </div>
                                <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-1000"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Rankings Table */}
            <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/50">
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Rang</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Soldat</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Volume Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {leaderboard.map((entry, index) => (
                            <tr key={entry.userId} className="hover:bg-slate-800/30 transition-colors group">
                                <td className="px-6 py-6">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${index === 0 ? "bg-yellow-500 text-yellow-950 scale-110 shadow-lg shadow-yellow-500/20" :
                                            index === 1 ? "bg-slate-300 text-slate-900" :
                                                index === 2 ? "bg-orange-600 text-orange-950" :
                                                    "bg-slate-800 text-slate-400"
                                        }`}>
                                        {index + 1}
                                    </div>
                                </td>
                                <td className="px-6 py-6">
                                    <Link
                                        href={`/u/${entry.nickname}`}
                                        className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors"
                                    >
                                        {entry.nickname}
                                    </Link>
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-2xl font-black text-white font-mono">{entry.totalReps.toLocaleString()}</span>
                                        <span className="text-[10px] font-bold text-slate-500 tracking-tighter uppercase">Records de Pushups</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <div className="text-center">
                <Link
                    href="/"
                    className="text-slate-500 hover:text-white transition-colors text-sm font-medium underline underline-offset-4"
                >
                    Retour à l'accueil
                </Link>
            </div>
        </div>
    );
}
