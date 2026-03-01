import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

interface ProfilePageProps {
    params: Promise<{ nickname: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const { nickname } = await params;

    const user = await prisma.user.findUnique({
        where: { nickname },
        include: {
            badges: {
                include: {
                    badge: true
                },
                orderBy: {
                    achievedAt: "desc"
                }
            }
        }
    });

    if (!user) {
        notFound();
    }

    const pushupStats = await prisma.exerciseSet.aggregate({
        where: {
            userId: user.id,
            exercise: "PUSHUP"
        },
        _sum: {
            reps: true
        }
    });

    const totalReps = pushupStats._sum.reps || 0;

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12">
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative flex flex-col sm:flex-row items-center gap-8">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-800 rounded-2xl flex items-center justify-center text-5xl shadow-2xl border border-slate-700">
                        {user.nickname.charAt(0).toUpperCase()}
                    </div>

                    <div className="text-center sm:text-left space-y-2">
                        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                            {user.nickname}
                        </h1>
                        <p className="text-slate-400 font-medium">
                            Membre depuis le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                    </div>
                </div>

                <div className="relative mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                        <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Pompes</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-4xl font-black text-white">{totalReps.toLocaleString()}</span>
                            <span className="text-indigo-400 font-bold">REPS</span>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                        <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Badges</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-4xl font-black text-white">{user.badges.length}</span>
                            <span className="text-purple-400 font-bold">GANÉS</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-indigo-500/20 text-indigo-400 rounded-lg text-lg">🏅</span>
                    Distinctions
                </h2>

                {user.badges.length === 0 ? (
                    <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl py-12 text-center">
                        <p className="text-slate-500">Aucun badge pour le moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {user.badges.map((ownership) => (
                            <div
                                key={ownership.badgeKey}
                                className="group relative bg-slate-900 border border-slate-800 rounded-xl p-4 text-center hover:border-indigo-500/50 transition-all hover:scale-[1.02]"
                                title={ownership.badge.description}
                            >
                                <div className="text-4xl mb-3 filter drop-shadow-lg group-hover:scale-110 transition-transform">
                                    {ownership.badge.emoji}
                                </div>
                                <h3 className="text-sm font-bold text-slate-200 line-clamp-1">
                                    {ownership.badge.name}
                                </h3>
                                <div className="mt-2 text-[10px] font-mono text-slate-500 uppercase">
                                    val: {ownership.currentValue}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <div className="flex justify-center pt-8">
                <Link
                    href="/leaderboard"
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
                >
                    Voir le Classement
                    <span className="text-xl">📊</span>
                </Link>
            </div>
        </div>
    );
}
