import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getTodayISO } from "@/lib/challenge";

interface ProfilePageProps {
    params: Promise<{ nickname: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const { nickname } = await params;
    const decodedNickname = decodeURIComponent(nickname);

    const user = await prisma.user.findFirst({
        where: { nickname: { equals: decodedNickname, mode: "insensitive" } },
        include: {
            badges: {
                include: {
                    badge: true
                },
                orderBy: {
                    achievedAt: "desc"
                }
            },
            fines: {
                orderBy: { date: "desc" },
                take: 20
            },
            medicalCertificates: {
                where: {
                    endDateISO: { gte: getTodayISO() }
                }
            }
        }
    });

    if (!user) {
        notFound();
    }

    const stats = await prisma.exerciseSet.groupBy({
        by: ['exercise'],
        where: { userId: user.id },
        _sum: { reps: true }
    });

    const pushups = stats.find(s => s.exercise === "PUSHUP")?._sum.reps || 0;
    const pullups = stats.find(s => s.exercise === "PULLUP")?._sum.reps || 0;
    const squats = stats.find(s => s.exercise === "SQUAT")?._sum.reps || 0;
    const totalReps = pushups + pullups + squats;

    const pushupPct = totalReps > 0 ? (pushups / totalReps) * 100 : 0;
    const pullupPct = totalReps > 0 ? (pullups / totalReps) * 100 : 0;
    const squatPct = totalReps > 0 ? (squats / totalReps) * 100 : 0;

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

                <div className="relative mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                        <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Reps</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-4xl font-black text-white">{totalReps.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                        <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Badges</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-4xl font-black text-white">{user.badges.length}</span>
                        </div>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                        <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Amendes</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-4xl font-black text-red-400">{(user as any).fines.filter((f: any) => f.status === 'unpaid').reduce((acc: number, f: any) => acc + f.amountEur, 0)}€</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* distribution Chart */}
            <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                    <span className="text-blue-600">📊</span> Répartition des efforts
                </h2>
                <div className="flex w-full h-8 rounded-full overflow-hidden bg-gray-100">
                    <div style={{ width: `${pushupPct}%` }} className="bg-blue-500 h-full transition-all" title={`Pompes: ${pushups}`} />
                    <div style={{ width: `${pullupPct}%` }} className="bg-indigo-500 h-full transition-all" title={`Tractions: ${pullups}`} />
                    <div style={{ width: `${squatPct}%` }} className="bg-purple-500 h-full transition-all" title={`Squats: ${squats}`} />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pompes</p>
                        <p className="text-lg font-black text-blue-600">{pushups}</p>
                        <p className="text-[10px] font-bold text-gray-400">{pushupPct.toFixed(1)}%</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tractions</p>
                        <p className="text-lg font-black text-indigo-600">{pullups}</p>
                        <p className="text-[10px] font-bold text-gray-400">{pullupPct.toFixed(1)}%</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Squats</p>
                        <p className="text-lg font-black text-purple-600">{squats}</p>
                        <p className="text-[10px] font-bold text-gray-400">{squatPct.toFixed(1)}%</p>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Fines History */}
                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                        <span className="text-red-500">💸</span> Historique Amendes
                    </h2>
                    <div className="bg-gray-50 rounded-3xl p-2 space-y-2">
                        {(user as any).fines.map((fine: any) => (
                            <div key={fine.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm border border-gray-100/50">
                                <div>
                                    <p className="text-sm font-black text-gray-900">{fine.amountEur}€</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{fine.date}</p>
                                </div>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${fine.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {fine.status === 'paid' ? 'Payée' : 'Dû'}
                                </span>
                            </div>
                        ))}
                        {(user as any).fines.length === 0 && <p className="text-center py-8 text-gray-400 font-bold uppercase text-[10px]">Rien à signaler 🫡</p>}
                    </div>
                </section>

                {/* Medical Certificates */}
                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2">
                        <span className="text-blue-400">🏥</span> Certificats Actifs
                    </h2>
                    <div className="bg-gray-50 rounded-3xl p-2 space-y-2">
                        {(user as any).medicalCertificates.map((cert: any) => (
                            <div key={cert.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100/50">
                                <p className="text-sm font-black text-gray-900 leading-tight">{cert.note || "Absence médical"}</p>
                                <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">
                                    Jusqu'au {cert.endDateISO}
                                </p>
                            </div>
                        ))}
                        {(user as any).medicalCertificates.length === 0 && <p className="text-center py-8 text-gray-400 font-bold uppercase text-[10px]">Apte au service 💪</p>}
                    </div>
                </section>
            </div>

            {/* Badges Section */}
            <section className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-indigo-500/20 text-indigo-400 rounded-lg text-lg">🏅</span>
                    Distinctions
                </h2>

                {(user as any).badges.length === 0 ? (
                    <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl py-12 text-center">
                        <p className="text-slate-500">Aucun badge pour le moment.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {(user as any).badges.map((ownership: any) => (
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
