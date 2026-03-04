import prisma from "@/lib/prisma";
import React from "react";
import { calculateAllUsersXP } from "@/lib/xp";

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

const LEVEL_UP_PHRASES = [
    "Il a rejoint fièrement le rang des [{ANIMAL}] {REASON}, cumulant {XP} XP. Impressionnant ! 🚀",
    "Faites place ! Un nouveau [{ANIMAL}] entre dans l'arène {REASON} avec {XP} XP. 🔥",
    "La rumeur disait vrai : la bête s'est réveillée. Bienvenue au rang des [{ANIMAL}] ! {REASON} ({XP} XP). 💯",
    "Même la gravité commence à le respecter. Il passe [{ANIMAL}] {REASON} pour {XP} XP ! 🤌",
    "Ses abdos ont leur propre code postal maintenant qu'il est [{ANIMAL}]. {REASON} ({XP} XP). 💪",
    "Incroyable ascension ! Transformé en [{ANIMAL}] {REASON}. Grosse prise de {XP} XP ! 🏆",
    "Une machine, une vraie. Il s'élève au palier [{ANIMAL}] {REASON}. Bilan : {XP} XP ! ⚙️",
    "Il l'a fait ! Promotion au grade animalier [{ANIMAL}] {REASON} ! ({XP} XP direct dans la poche). 🎒",
    "La sueur paie. Majestueux comme un [{ANIMAL}], il valide ce niveau {REASON} ({XP} XP). 💧",
    "Certains dorment, lui il évolue en [{ANIMAL}]. C'est {REASON} qui lui donne ces {XP} XP. 😴",
    "On n'arrête plus le progrès ! Level UP en [{ANIMAL}] {REASON}. Une moisson de {XP} XP ! 🌾",
    "Mains tremblantes, mais niveau validé ! Il est désormais [{ANIMAL}] {REASON} (+{XP} XP). 🫨",
    "Le voici propulsé au statut de [{ANIMAL}] {REASON}. Une rafale de {XP} XP d'un coup ! 🌪️",
    "Et boum ! Nouveau palier franchi. Il arbore l'icône du [{ANIMAL}] {REASON} et prend {XP} XP. 💥",
    "Une régularité d'horloge suisse. Il devient [{ANIMAL}] {REASON} (+{XP} XP). ⏱️",
    "Le règne du [{ANIMAL}] commence ! {REASON} lui offrant gentiment {XP} XP. 👑",
    "Plus solide qu'un roc. Son rang de [{ANIMAL}] a été arraché {REASON} avec {XP} XP à la clé. 🪨",
    "Alerte génie transpirant ! Il mute en [{ANIMAL}] {REASON} et encaisse {XP} XP. 🧬",
    "Si près des étoiles... Il attrape le niveau [{ANIMAL}] {REASON} ! (+{XP} XP). 🌟",
    "Rien ne l'arrête, même pas les courbatures. Grade de [{ANIMAL}] atteint {REASON} ({XP} XP) ! 🩸"
];

const LEVEL_DOWN_PHRASES = [
    "Triste jour pour la patrie... La chute est dure : retour au rang des [{ANIMAL}] {REASON}. Perte sèche : {XP} XP. 📉",
    "Coup dur pour le moral (et les pecs) ! Rétrogradé en [{ANIMAL}] {REASON}. Moins {XP} XP... 🚔",
    "Alerte régression ! Le voilà rabaissé au rang de [{ANIMAL}] {REASON}. Tu nous dois {XP} XP. 🤡",
    "Ouch. La gravité l'a rattrapé. Rétrogradation confirmée en [{ANIMAL}] {REASON}. Adieu {XP} XP. 📉",
    "C'est la dégringolade... Adieu les sommets, rebonjour le [{ANIMAL}] {REASON}. Bilan : {XP} XP brûlés. 📉"
];

function getPhrase(eventId: string, isLevelUp: boolean, animal: string, reason: string, xpDiff: string) {
    const list = isLevelUp ? LEVEL_UP_PHRASES : LEVEL_DOWN_PHRASES;
    let hash = 0;
    for (let i = 0; i < eventId.length; i++) {
        hash = (hash << 5) - hash + eventId.charCodeAt(i);
        hash |= 0;
    }
    const template = list[Math.abs(hash) % list.length];
    return template
        .replace("{ANIMAL}", animal)
        .replace("{REASON}", reason)
        .replace("{XP}", xpDiff);
}

export default async function GazetteXP() {
    const events = await (prisma as any).badgeEvent.findMany({
        where: { eventType: { in: ["LEVEL_UP", "LEVEL_DOWN"] } },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
            toUser: {
                select: { nickname: true }
            }
        }
    });

    const isEmpty = !events || events.length === 0;

    let displayEvents = events;

    // S'il n'y a encore aucun événement de niveau enregistré en base de données, on génère un Top 3 rétroactif.
    if (isEmpty) {
        const allUsers = await prisma.user.findMany({
            where: { nickname: { not: 'modo' } },
            select: { id: true, nickname: true, sets: true }
        });
        const badgeOwnerships = await (prisma as any).badgeOwnership.findMany();
        const xpScores = calculateAllUsersXP(allUsers, badgeOwnerships);

        const top3 = xpScores.sort((a, b) => b.totalXP - a.totalXP).slice(0, 3);

        displayEvents = top3.map((userXP, idx) => ({
            id: `fallback-${userXP.id}`,
            toUser: { nickname: userXP.nickname },
            newValue: userXP.level,
            eventType: "LEVEL_UP",
            createdAt: new Date(Date.now() - idx * 3600000).toISOString(),
            metadata: JSON.stringify({
                animal: userXP.animal,
                emoji: userXP.emoji,
                xpDiff: Math.round(userXP.totalXP),
                reason: "pour l'ensemble de sa carrière majestueuse"
            })
        }));
    }

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

                <div className="space-y-4">
                    {displayEvents.map((event: any, idx: number) => {
                        let metaDataObj: any = null;
                        try {
                            if (event.metadata) metaDataObj = JSON.parse(event.metadata);
                        } catch (e) { }

                        const nickname = event.toUser?.nickname || "Inconnu";
                        const level = event.newValue;
                        const animal = metaDataObj?.animal || "Inconnu";
                        const emoji = metaDataObj?.emoji || "⭐";
                        const xpDiff = metaDataObj?.xpDiff || metaDataObj?.xpGained || 0; // fallback backward compat
                        const reason = metaDataObj?.reason || "grâce à son assiduité";
                        const timeAgo = getTimeAgo(event.createdAt);
                        const isLevelUp = event.eventType === "LEVEL_UP" || !event.eventType;

                        const generatedPhrase = getPhrase(event.id, isLevelUp, animal, reason, xpDiff >= 0 ? `+${xpDiff.toLocaleString('fr-FR')}` : xpDiff.toLocaleString('fr-FR'));

                        return (
                            <div key={event.id} className={`${isLevelUp ? 'bg-white/5 border-white/10' : 'bg-red-900/10 border-red-500/20'} border rounded-2xl p-4 transition-colors`}>
                                <div className="flex items-start gap-4">
                                    <div className="text-4xl mt-1 drop-shadow-md">
                                        {isLevelUp ? emoji : '🚨'}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-bold text-white text-base leading-tight">
                                                <span className={`${isLevelUp ? 'text-indigo-400' : 'text-red-400'} font-black`}>{nickname}</span> {isLevelUp ? 'a atteint le niveau' : 'a été rétrogradé au niveau'} <span className={`${isLevelUp ? 'text-yellow-400' : 'text-red-400'} font-black text-lg`}>{level}</span> !
                                            </h3>
                                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap bg-slate-800 px-2 py-1 rounded-full">
                                                {timeAgo}
                                            </span>
                                        </div>

                                        <p className="text-sm text-slate-300">
                                            {generatedPhrase}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
