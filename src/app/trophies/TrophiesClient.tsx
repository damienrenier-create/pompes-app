"use client"

import { useState } from "react"
import Link from "next/link"

interface BadgeDef {
    key: string
    name: string
    emoji: string
    description: string
    isUnique?: boolean
    threshold?: number
    exerciseScope?: string
    metricType?: string
}

interface UserStats {
    totalPushups: number
    totalPullups: number
    totalSquats: number
    totalAll: number
    maxSetAll: number
}

interface EventConfig {
    name: string
    emoji: string
    startDate: string
    endDate: string
    description: string
}

const UPCOMING_EVENTS: EventConfig[] = [
    { name: "Halloween", emoji: "🎃", startDate: "2026-10-31", endDate: "2026-10-31", description: "Fête d'Halloween" },
    { name: "Pâques", emoji: "🥚", startDate: "2026-04-05", endDate: "2026-04-05", description: "Chasse aux oeufs" },
    { name: "Saint-Patrice", emoji: "🍀", startDate: "2026-03-17", endDate: "2026-03-17", description: "Le Saint-Patrice" },
]

export default function TrophiesClient({
    earnedBadges,
    badgeDefinitions,
    userStats
}: {
    earnedBadges: string[],
    badgeDefinitions: BadgeDef[],
    userStats: UserStats
}) {
    const [selectedBadge, setSelectedBadge] = useState<BadgeDef | null>(null)

    // Progression logic
    const nextBadges = badgeDefinitions
        .filter(b => !earnedBadges.includes(b.key) && b.threshold)
        .map(b => {
            let current = 0
            if (b.metricType === "MILESTONE_TOTAL") {
                current = userStats.totalAll
            } else if (b.metricType === "MILESTONE_SET") {
                current = userStats.maxSetAll
            } else if (b.exerciseScope === "PUSHUPS") {
                current = userStats.totalPushups
            } else if (b.exerciseScope === "PULLUPS") {
                current = userStats.totalPullups
            } else if (b.exerciseScope === "SQUATS") {
                current = userStats.totalSquats
            }

            const progress = Math.min(100, (current / (b.threshold || 1)) * 100)
            return { ...b, current, progress }
        })
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 3)

    const BadgeItem = ({ badge, isEarned = false }: { badge: BadgeDef, isEarned?: boolean }) => (
        <div
            onClick={() => setSelectedBadge(badge)}
            className={`cursor-pointer p-4 rounded-3xl border transition-all ${isEarned ? 'bg-indigo-600/10 border-indigo-500/20 hover:bg-indigo-600/20' : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-60 grayscale'}`}
        >
            <div className="flex items-center gap-4">
                <span className="text-3xl">{badge.emoji}</span>
                <div>
                    <p className="text-[10px] font-black text-white uppercase leading-none mb-1">{badge.name}</p>
                    {isEarned && <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">Acquis ✅</span>}
                </div>
            </div>
        </div>
    )

    const getDaysUntil = (dateStr: string) => {
        const diff = new Date(dateStr).getTime() - new Date().getTime()
        return Math.ceil(diff / (1000 * 60 * 60 * 24))
    }

    return (
        <div className="space-y-12 pb-20">
            {/* 🎯 PROCHAINS BADGES */}
            <section className="space-y-4">
                <h2 className="text-xl font-black text-white px-2">🎯 Prochains badges à débloquer</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {nextBadges.map(b => (
                        <div key={b.key} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-4xl">{b.emoji}</span>
                                <span className="text-xs font-black text-indigo-400">{Math.round(b.progress)}%</span>
                            </div>
                            <div>
                                <p className="text-sm font-black text-white uppercase">{b.name}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">{b.current} / {b.threshold} Reps</p>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${b.progress}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 🔥 COMPÉTITIFS */}
            <section className="space-y-4">
                <h2 className="text-xl font-black text-white px-2">🔥 Compétitifs</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {badgeDefinitions.filter(b => b.key.includes('flex') || b.key.includes('king')).map(b => (
                        <BadgeItem key={b.key} badge={b} isEarned={earnedBadges.includes(b.key)} />
                    ))}
                </div>
            </section>

            {/* 👑 MILESTONES */}
            <section className="space-y-4">
                <h2 className="text-xl font-black text-white px-2">👑 Milestones & Légendaires</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {badgeDefinitions.filter(b => b.key.includes('unique') || b.key === 'centurion' || b.key === 'general_10k' || b.key === 'survivor_30d').map(b => (
                        <BadgeItem key={b.key} badge={b} isEarned={earnedBadges.includes(b.key)} />
                    ))}
                </div>
            </section>

            {/* 🎉 EVENTS */}
            <section className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-[2.5rem] p-8">
                    <h2 className="text-xl font-black text-white mb-6">🎉 Events à venir</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {UPCOMING_EVENTS.filter(e => getDaysUntil(e.startDate) >= 0).sort((a, b) => getDaysUntil(a.startDate) - getDaysUntil(b.startDate)).map(e => (
                            <div key={e.name} className="flex gap-4 items-center bg-white/5 p-4 rounded-3xl border border-white/5">
                                <span className="text-4xl">{e.emoji}</span>
                                <div>
                                    <p className="text-sm font-black text-white uppercase">{e.name}</p>
                                    <p className="text-xs font-bold text-indigo-400">J-{getDaysUntil(e.startDate)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modal Detail */}
            {selectedBadge && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-lg overflow-hidden p-8 space-y-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <span className="text-7xl">{selectedBadge.emoji}</span>
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase">{selectedBadge.name}</h2>
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{earnedBadges.includes(selectedBadge.key) ? "Possédé ✅" : "Verrouillé 🔒"}</span>
                            </div>
                            <p className="text-slate-400 font-medium">{selectedBadge.description}</p>
                        </div>
                        <button onClick={() => setSelectedBadge(null)} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl uppercase tracking-widest">Fermer</button>
                    </div>
                </div>
            )}
        </div>
    )
}
