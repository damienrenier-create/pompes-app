import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BadgesPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const userId = session.user.id;

    const ownedBadges = await prisma.badgeOwnership.findMany({
        where: {
            currentUserId: userId,
        },
        include: {
            badge: true,
        },
        orderBy: {
            achievedAt: "desc",
        },
    });

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Mes Badges
                    </h1>
                    <p className="mt-2 text-lg text-slate-400">
                        Tes exploits et distinctions durement gagnés.
                    </p>
                </div>
                <Link
                    href="/"
                    className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                >
                    Retour
                </Link>
            </header>

            {ownedBadges.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <span className="text-5xl">🌫️</span>
                    <p className="mt-4 text-slate-400">Tu n'as pas encore de badges. Continue l'entraînement !</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ownedBadges.map((ownership) => (
                        <div
                            key={ownership.badgeKey}
                            className="relative group overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500/50 transition-all duration-300"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-6xl">{ownership.badge.emoji}</span>
                            </div>

                            <div className="relative flex flex-col h-full">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 flex items-center justify-center bg-slate-800 rounded-xl text-3xl shadow-inner">
                                        {ownership.badge.emoji}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                                            {ownership.badge.name}
                                        </h3>
                                        <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
                                            {ownership.badge.isUnique ? "Unique" : "Standard"}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-400 mb-6 flex-grow">
                                    {ownership.badge.description}
                                </p>

                                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                                    <div className="flex flex-col">
                                        <span className="text-slate-500">Valeur</span>
                                        <span className="font-mono text-white text-sm">{ownership.currentValue}</span>
                                    </div>
                                    <div className="flex flex-col text-right">
                                        <span className="text-slate-500">Obtenu le</span>
                                        <span className="text-white">
                                            {new Date(ownership.achievedAt).toLocaleDateString("fr-FR", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
