import prisma from "@/lib/prisma";
import React from "react";

function getTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffMins > 0) return `il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    return "à l'instant";
}

export default async function GazetteXP() {
    const levelUps = await (prisma as any).badgeEvent.findMany({
        where: { eventType: "LEVEL_UP" },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
            toUser: {
                select: { nickname: true }
            }
        }
    });

    const isEmpty = !levelUps || levelUps.length === 0;

    return (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 rounded-[2rem] p-6 sm:p-8 shadow-xl border border-indigo-500/20 relative overflow-hidden mt-8">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-9xl">📰</div>

            <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 border-b border-indigo-500/20 pb-4">
                    <span className="text-3xl">📯</span>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-wider">La Gazette de l'XP</h2>
                        <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest">Dernières ascensions</p>
                    </div>
                </div>

                {isEmpty ? (
                    <div className="text-center py-6 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-slate-400 font-medium italic">Le calme règne sur les rangs... Personne n'a encore atteint de niveau supérieur.</p>
                        <p className="text-indigo-400 text-sm mt-2 font-bold">Sois le premier à faire les gros titres ! 🚀</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {levelUps.map((event: any, idx: number) => {
                            let metaDataObj: any = null;
                            try {
                                if (event.metadata) metaDataObj = JSON.parse(event.metadata);
                            } catch (e) { }

                            const nickname = event.toUser?.nickname || "Inconnu";
                            const level = event.newValue;
                            const animal = metaDataObj?.animal || "Inconnu";
                            const emoji = metaDataObj?.emoji || "⭐";
                            const xpGained = metaDataObj?.xpGained || 0;
                            const reason = metaDataObj?.reason || "grâce à son assiduité";
                            const timeAgo = getTimeAgo(event.createdAt);

                            return (
                                <div key={event.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="text-4xl mt-1 drop-shadow-md">
                                            {emoji}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="font-bold text-white text-base leading-tight">
                                                    <span className="text-indigo-400 font-black">{nickname}</span> a atteint le niveau <span className="text-yellow-400 font-black text-lg">{level}</span> !
                                                </h3>
                                                <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap bg-slate-800 px-2 py-1 rounded-full">
                                                    {timeAgo}
                                                </span>
                                            </div>

                                            <p className="text-sm text-slate-300">
                                                Il rejoint fièrement le rang des <span className="font-bold text-white uppercase tracking-tight">[{animal}]</span> {reason}, ce qui lui a rapporté <span className="font-mono text-indigo-300 font-bold">+{xpGained.toLocaleString('fr-FR')} XP</span>. Impressionnant ! 🚀
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
