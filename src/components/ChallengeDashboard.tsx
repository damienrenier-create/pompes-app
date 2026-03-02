"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface DashboardData {
    todayISO: string
    selectedDateISO: string
    requiredReps: { selected: number; today: number }
    setsSelected: { pushups: number[]; pullups: number[]; squats: number[] }
    totalsSelected: { pushups: number; pullups: number; squats: number; total: number }
    leaderboard: Array<{
        nickname: string
        completionRate: number
        streakCurrent: number
        totalRepsAllTime: number
        totalPushupsAllTime: number
        totalPullupsAllTime: number
        totalSquatsAllTime: number
        repsToday: number
        finesDueEur: number
    }>
    records: Record<string, {
        badge: string
        pushups: { winner: string; maxReps: number }
        pullups: { winner: string; maxReps: number }
        squats: { winner: string; maxReps: number }
    }>
    badges: {
        earned: {
            trophies: Array<{ id: string; label: string; emoji: string; winners: string[] }>
            specialDays: Array<{ date: string; label: string; emoji: string; winners: string[] }>
        }
        available: {
            trophies: Array<{ id: string; label: string; emoji: string }>
            specialDays: Array<{ date: string; label: string; emoji: string }>
        }
        competitive: {
            ownerships: any[]
            events: any[]
            danger: any[]
        }
    }
    cagnotte: {
        enabled: boolean
        potEur: number
        currentReward: { label: string; min: number }
        nextReward?: { label: string; min: number }
        finesList: Array<{ nickname: string; amount: number }>
    }
    sallyUp: {
        enabledForSelectedDate: boolean
        selectedDateReps: number
        monthPodium: Array<{ nickname: string; reps: number; totalPushupsAllTime: number }>
    }
    graphs: {
        myDaily: Array<{ date: string; pushups: number; pullups: number; squats: number; total: number }>
    }
}

const DEFAULT_DASHBOARD_DATA: DashboardData = {
    todayISO: new Date().toISOString().split('T')[0],
    selectedDateISO: new Date().toISOString().split('T')[0],
    requiredReps: { selected: 10, today: 10 },
    setsSelected: { pushups: [], pullups: [], squats: [] },
    totalsSelected: { pushups: 0, pullups: 0, squats: 0, total: 0 },
    leaderboard: [],
    records: {},
    badges: {
        earned: { trophies: [], specialDays: [] },
        available: { trophies: [], specialDays: [] },
        competitive: { ownerships: [], events: [], danger: [] }
    },
    cagnotte: {
        enabled: false,
        potEur: 0,
        currentReward: { label: "Encore un effort 😄", min: 0 },
        finesList: []
    },
    sallyUp: { enabledForSelectedDate: false, selectedDateReps: 0, monthPodium: [] },
    graphs: { myDaily: [] }
}

export default function ChallengeDashboard() {
    const router = useRouter()
    const { data: session } = useSession()
    const [data, setData] = useState<DashboardData>(DEFAULT_DASHBOARD_DATA)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<'saisie' | 'graphs' | 'cagnotte' | 'trophees' | 'km' | 'zen'>('saisie')
    const [selectedDate, setSelectedDate] = useState<string>(DEFAULT_DASHBOARD_DATA.selectedDateISO)
    const lastFetchTime = useRef<number>(Date.now())
    const [localSets, setLocalSets] = useState<{ pushups: (number | "")[]; pullups: (number | "")[]; squats: (number | "")[] }>({
        pushups: [""],
        pullups: [""],
        squats: [""],
    })
    const [sallyReps, setSallyReps] = useState<number>(0)
    const [showHonorPopup, setShowHonorPopup] = useState<{ badge: any; type: string } | null>(null)
    const [honorChecked, setHonorChecked] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

    const lastInputRef = useRef<HTMLInputElement | null>(null)

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchData = async (dateISO?: string) => {
        try {
            const url = dateISO ? `/api/dashboard?date=${dateISO}` : "/api/dashboard"
            const res = await fetch(url)
            if (res.ok) {
                const d: DashboardData = await res.json()

                // --- Stolen Badge Toast Detection ---
                if (d.badges?.competitive?.events?.length > 0) {
                    const latestSteal = d.badges.competitive.events.find((ev: any) =>
                        ev.eventType === 'STEAL' &&
                        ev.fromUserId === (session?.user as any)?.id &&
                        new Date(ev.createdAt).getTime() > lastFetchTime.current
                    )
                    if (latestSteal) {
                        // Increased display time for the "Devil" message (A11)
                        setToast({ message: `On t'a volé [${latestSteal.badge?.name}] 😈`, type: 'error' })
                        setTimeout(() => setToast(null), 8000)
                    }
                }
                lastFetchTime.current = Date.now()

                setData(d)
                setSelectedDate(d.selectedDateISO || getTodayISO())
                setSallyReps(d.sallyUp?.selectedDateReps || 0)

                setLocalSets({
                    pushups: d.setsSelected?.pushups?.length > 0 ? d.setsSelected.pushups : [""],
                    pullups: d.setsSelected?.pullups?.length > 0 ? d.setsSelected.pullups : [""],
                    squats: d.setsSelected?.squats?.length > 0 ? d.setsSelected.squats : [""],
                })
            }
        } catch (err) {
            showToast("Erreur de chargement", "error")
        } finally {
            setLoading(false)
        }
    }

    const getTodayISO = () => new Date().toISOString().split('T')[0]

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const tab = params.get('tab')
        if (tab && ['saisie', 'graphs', 'cagnotte', 'trophees', 'km', 'zen'].includes(tab)) {
            setActiveTab(tab as any)
        }
    }, [router]) // React on navigation

    useEffect(() => {
        fetchData()
    }, [])

    const handleDateChange = (date: string) => {
        setLoading(true)
        fetchData(date)
    }

    const addSet = (type: 'pushups' | 'pullups' | 'squats') => {
        const current = localSets[type] || []
        // Start empty by default (A4)
        setLocalSets({ ...localSets, [type]: [...current, ""] })
        setTimeout(() => lastInputRef.current?.focus(), 10)
    }

    const removeSet = (type: 'pushups' | 'pullups' | 'squats', index: number) => {
        setLocalSets({ ...localSets, [type]: (localSets[type] || []).filter((_, i) => i !== index) })
    }

    const handleSetChange = (type: 'pushups' | 'pullups' | 'squats', index: number, val: string) => {
        const newSets = [...(localSets[type] || [])]
        if (val === "") {
            newSets[index] = ""
        } else {
            newSets[index] = parseInt(val) || 0
        }
        setLocalSets({ ...localSets, [type]: newSets })
    }

    const adjustSet = (type: 'pushups' | 'pullups' | 'squats', index: number, delta: number) => {
        const newSets = [...(localSets[type] || [])]
        const current = Number(newSets[index]) || 0
        newSets[index] = Math.max(0, current + delta)
        setLocalSets({ ...localSets, [type]: newSets })
    }

    const saveLogs = async () => {
        // Validation: prevent empty or <= 0 (A4)
        const allReps = [...localSets.pushups, ...localSets.pullups, ...localSets.squats].map(r => Number(r) || 0);
        const total = allReps.reduce((a, b) => a + b, 0);

        if (total <= 0) {
            showToast("Veuillez entrer au moins une répétition", "error");
            return;
        }

        // Potential badge check (A12) - Client side preview
        const willEarnCompetitive = data.badges.competitive.ownerships.some(bo => {
            if (bo.locked) return false;
            const def = bo.badge;
            const currentTotalAll = data.leaderboard.find(u => (u as any).id === (session?.user as any)?.id)?.totalRepsAllTime || 0;
            const newTotalAll = currentTotalAll + total;

            if (def.metricType === "MAX_SET") {
                const maxInLocal = Math.max(0, ...allReps);
                return maxInLocal > bo.currentValue;
            }
            // Simple check for main competitive metrics
            return false;
        });

        if (willEarnCompetitive && !honorChecked) {
            setShowHonorPopup({ badge: null, type: 'pre-save' });
            return;
        }

        // High reps confirmation (A4)
        const highRepSet = allReps.find(r => r >= 200);
        if (highRepSet && !confirm(`Vous avez saisi une série de ${highRepSet} répétitions. Confirmer ?`)) {
            return;
        }

        setSaving(true)
        try {
            const res = await fetch("/api/logs/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: selectedDate, sets: localSets }),
            })
            if (res.ok) {
                showToast("Progression sauvegardée", "success")
                setHonorChecked(false)
                fetchData(selectedDate)
            }
        } catch (err) {
            showToast("Erreur réseau", "error")
        } finally {
            setSaving(false)
        }
    }

    const saveSally = async () => {
        setSaving(true)
        try {
            const res = await fetch("/api/challenge/sally", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ date: selectedDate, seconds: sallyReps }),
            })
            if (res.ok) {
                showToast("Sally Up sauvegardé", "success")
                fetchData(selectedDate)
            }
        } catch (err) {
            showToast("Erreur réseau", "error")
        } finally {
            setSaving(false)
        }
    }

    if (loading && !data?.todayISO) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    )

    const allowedDates = []
    for (let i = 0; i < 4; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const iso = d.toISOString().split('T')[0]
        allowedDates.push({ iso, label: i === 0 ? "Aujourd'hui" : i === 1 ? "Hier" : i === 2 ? "J-2" : "J-3" })
    }

    const sumSets = (sets: (number | "")[]) => sets.reduce<number>((a, b) => a + (Number(b) || 0), 0)
    const currentTotal = sumSets(localSets?.pushups || []) + sumSets(localSets?.pullups || []) + sumSets(localSets?.squats || [])
    const missing = Math.max(0, (data?.requiredReps?.selected ?? 0) - currentTotal)

    const totalSquatsAllTime = data.leaderboard.find(u => (u as any).id === (session?.user as any)?.id)?.totalSquatsAllTime || 0;
    const badgesCount = data.badges.earned.trophies.length + data.badges.earned.specialDays.length;

    const showKM = totalSquatsAllTime >= 1000;
    const showStretching = badgesCount >= 5;

    const getStreakEmoji = (rate: number, streak: number) => {
        if (rate >= 100) return { label: "Parfait", emoji: "👑" };
        if (streak >= 5) return { label: "Streak", emoji: "🔥" };
        if (rate >= 80) return { label: "Solide", emoji: "🧱" };
        return { label: "Débutant", emoji: "🌱" };
    }

    const getSetEmoji = (reps: number) => {
        if (reps >= 50) return "👑";
        if (reps >= 40) return "🚀";
        if (reps >= 30) return "🦾";
        if (reps >= 20) return "🔥";
        if (reps >= 10) return "💪";
        return "";
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
            {toast && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg text-white font-bold transition-all ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {toast.message}
                </div>
            )}

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tighter text-blue-600 leading-none">POMPES APP</h1>
                        <p className="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">Version 3.1 • Clean State</p>
                    </div>
                </div>

                {activeTab === 'saisie' && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                        {allowedDates.map(d => (
                            <button
                                key={d.iso}
                                onClick={() => handleDateChange(d.iso)}
                                className={`flex-1 min-w-[100px] py-3 rounded-2xl font-black text-xs border-2 transition-all ${selectedDate === d.iso ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'}`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {activeTab === 'saisie' && (
                <>
                    {/* TOP: CIBLE */}
                    <div className="bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden">
                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Cible {selectedDate === data?.todayISO ? "Aujourd'hui" : selectedDate}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-black">{data?.requiredReps?.selected ?? 0}</span>
                                    <span className="text-slate-500 font-bold uppercase text-xs">reps</span>
                                </div>
                                <div className="mt-2 text-xs font-bold text-slate-400">
                                    Effectué : <span className="text-white">{currentTotal} reps</span>
                                    {currentTotal > (data?.requiredReps?.selected ?? 0) && (
                                        <span className="ml-2 text-green-400">+{currentTotal - (data?.requiredReps?.selected ?? 0)} bonus 💪</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                {missing > 0 ? (
                                    <div className="flex flex-col items-end">
                                        <span className="text-3xl font-black text-orange-400">-{missing}</span>
                                        <span className="text-[10px] font-black text-slate-400 italic">À FAIRE</span>
                                    </div>
                                ) : (
                                    <div className="bg-green-500 text-white px-4 py-2 rounded-full font-black text-sm shadow-lg animate-bounce">VALIDÉ ✅</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SETS INPUT */}
                    <div className="space-y-4">
                        {(['pushups', 'pullups', 'squats'] as const).map(type => (
                            <div key={type} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{type === 'pushups' ? '💪' : type === 'pullups' ? '🦍' : '🦵'}</span>
                                        <span className="font-black text-gray-800 uppercase text-xs">{type === 'pushups' ? 'Pompes' : type === 'pullups' ? 'Tractions' : 'Squats'}</span>
                                    </div>
                                    <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs">
                                        {(localSets[type] || []).reduce<number>((a, b) => a + (Number(b) || 0), 0)} reps
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {(localSets[type] || []).map((val, idx) => (
                                        <div key={idx} className="flex flex-col items-center gap-2">
                                            <div className="relative group">
                                                <input
                                                    type="number"
                                                    inputMode="numeric"
                                                    value={val}
                                                    placeholder="0"
                                                    ref={idx === (localSets[type]?.length ?? 0) - 1 ? lastInputRef : null}
                                                    onChange={(e) => handleSetChange(type, idx, e.target.value)}
                                                    className="w-20 h-16 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl text-center font-black text-gray-900 transition-all text-xl outline-none"
                                                />
                                                {getSetEmoji(Number(val) || 0) && <span className="absolute -bottom-1 -left-1 text-xs">{getSetEmoji(Number(val) || 0)}</span>}
                                                <button onClick={() => removeSet(type, idx)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 text-white rounded-full text-xs font-black opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg">✕</button>
                                            </div>
                                            {/* Stepper buttons (A3) */}
                                            <div className="flex gap-1">
                                                <button onClick={() => adjustSet(type, idx, -5)} className="w-8 h-8 bg-gray-100 rounded-lg font-black text-gray-500">-5</button>
                                                <button onClick={() => adjustSet(type, idx, 5)} className="w-8 h-8 bg-blue-50 rounded-lg font-black text-blue-600">+5</button>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={() => addSet(type)} className="w-20 h-16 rounded-2xl border-2 border-dashed border-gray-200 text-gray-300 hover:text-blue-500 hover:border-blue-300 transition-all font-black text-2xl flex items-center justify-center">+</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={saveLogs} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-3xl shadow-xl transition-all disabled:opacity-50 uppercase tracking-widest text-sm transform active:scale-[0.98]">
                        {saving ? "Sauvegarde..." : "Valider la séance"}
                    </button>

                    {/* RENAME & REPOSITION: 🏆 RECORDS HIGHLIGHT (NOW BELOW SAVE) */}
                    <div className="space-y-3 pt-2">
                        <div className="flex flex-col ml-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">🏆</span>
                                <h3 className="font-black text-xs text-gray-800 uppercase tracking-widest leading-none">Records — Plus longue série</h3>
                            </div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 ml-7 tracking-tighter">Meilleure série sur la période (pas le total du jour)</p>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {(['day', 'week', 'month', 'year'] as const).map(pid => {
                                const pRec = data?.records?.[pid];
                                return (
                                    <div key={pid} className="bg-gradient-to-br from-white to-gray-50 p-4 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{pid === 'day' ? 'Jour' : pid === 'week' ? 'Semaine' : pid === 'month' ? 'Mois' : 'Année'}</span>
                                            <span className="text-lg">{pRec?.badge ?? '-'}</span>
                                        </div>
                                        {(['pushups', 'pullups', 'squats'] as const).map(ex => (
                                            <div key={ex} className="flex justify-between items-center mb-1.5 opacity-90 transition-opacity hover:opacity-100">
                                                <span className="text-md">{ex === 'pushups' ? '💪' : ex === 'pullups' ? '🦍' : '🦵'}</span>
                                                <div className="text-right overflow-hidden">
                                                    <p className="text-[7.5px] font-bold text-gray-400 truncate max-w-[70px] leading-none mb-0.5 uppercase tracking-tighter">{pRec?.[ex]?.winner || 'Aucun record pour l’instant'}</p>
                                                    <p className="text-xs font-black text-gray-800 leading-none">{pRec?.[ex]?.maxReps ?? 0}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* SALLY UP SECTION */}
                    {data?.sallyUp?.enabledForSelectedDate && (
                        <div className="bg-yellow-50 rounded-3xl p-6 border-2 border-yellow-200 space-y-4">
                            <div className="flex justify-between items-center text-yellow-800">
                                <h3 className="font-black uppercase italic tracking-tighter">Bring Sally Up 💪</h3>
                                <span className="bg-yellow-200 px-3 py-1 rounded-full text-[10px] font-black uppercase">Challenge Mensuel</span>
                            </div>
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="block text-[10px] font-black text-yellow-700 uppercase mb-1 ml-1">Total Pompes Réalisées</label>
                                    <input type="number" value={sallyReps} onChange={(e) => setSallyReps(parseInt(e.target.value) || 0)} className="w-full h-14 bg-white border-2 border-yellow-300 rounded-2xl text-center font-black text-xl outline-none focus:border-yellow-500 text-gray-900" />
                                </div>
                                <button onClick={saveSally} className="h-14 px-8 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-black rounded-2xl transition-all shadow-md">OK</button>
                            </div>
                            <div className="grid grid-cols-1 gap-2 mt-4 pt-4 border-t border-yellow-200">
                                {(data?.sallyUp?.monthPodium || []).length > 0 ? data.sallyUp.monthPodium.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center px-4 py-2 bg-white/50 rounded-xl">
                                        <span className="font-bold text-yellow-900">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"} {p?.nickname || 'Anonyme'}</span>
                                        <div className="text-right">
                                            <p className="font-black text-yellow-700 text-sm">{p?.reps ?? 0} reps</p>
                                        </div>
                                    </div>
                                )) : <p className="text-center font-black text-yellow-600 text-[10px] uppercase italic">Pas encore de record</p>}
                            </div>
                        </div>
                    )}

                    {/* ASSIDUITE (NOW BOTTOM) */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-center items-center gap-2">
                            <span className="text-xs">✨</span>
                            <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest text-center">Classement Assiduité</h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {(data?.leaderboard || []).map((u, i) => {
                                const ind = getStreakEmoji(u.completionRate, u.streakCurrent);
                                return (
                                    <div key={u.nickname || i} className="flex justify-between items-center p-4 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 text-center font-black ${i < 3 ? 'text-blue-500' : 'text-gray-300'}`}>{i + 1}</span>
                                            <div>
                                                <p className="font-black text-gray-900 text-sm leading-none">{u.nickname || 'Anonyme'}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <span className="text-[10px]">{ind.emoji}</span>
                                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-tight">{ind.label}</span>
                                                    {u.streakCurrent > 0 && <span className="text-[8px] font-black text-orange-400">({u.streakCurrent}j 🔥)</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right"><p className="font-black text-blue-600 text-sm">{Math.round(u.completionRate)}%</p></div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'graphs' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-6 border-b pb-2">Répartition (30j)</h3>
                        {(() => {
                            const t = (data?.graphs?.myDaily || []).reduce((acc, d) => ({
                                pushups: acc.pushups + (d?.pushups || 0),
                                pullups: acc.pullups + (d?.pullups || 0),
                                squats: acc.squats + (d?.squats || 0),
                                all: acc.all + (d?.total || 0)
                            }), { pushups: 0, pullups: 0, squats: 0, all: 0 })

                            if (t.all === 0) return <p className="text-center py-10 text-gray-300 font-bold uppercase text-xs italic tracking-widest">Aucune donnée sur les 30 derniers jours</p>

                            return (
                                <div className="space-y-6">
                                    <div className="h-10 w-full flex rounded-2xl overflow-hidden shadow-inner border border-gray-100 font-black text-white text-[10px]">
                                        {t.pushups > 0 && <div className="bg-blue-500 h-full flex items-center justify-center transition-all hover:brightness-110" style={{ width: `${(t.pushups / t.all) * 100}%` }}>{Math.round((t.pushups / t.all) * 100)}%</div>}
                                        {t.pullups > 0 && <div className="bg-orange-500 h-full flex items-center justify-center transition-all hover:brightness-110" style={{ width: `${(t.pullups / t.all) * 100}%` }}>{Math.round((t.pullups / t.all) * 100)}%</div>}
                                        {t.squats > 0 && <div className="bg-green-500 h-full flex items-center justify-center transition-all hover:brightness-110" style={{ width: `${(t.squats / t.all) * 100}%` }}>{Math.round((t.squats / t.all) * 100)}%</div>}
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl mb-1">💪</p>
                                            <p className="text-xs font-black text-gray-700">{t.pushups}</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase">Pompes</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl mb-1">🦍</p>
                                            <p className="text-xs font-black text-gray-700">{t.pullups}</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase">Tractions</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl mb-1">🦵</p>
                                            <p className="text-xs font-black text-gray-700">{t.squats}</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase">Squats</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })()}
                    </div>
                </div>
            )}

            {activeTab === 'cagnotte' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-center shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-transparent to-transparent"></div>
                        <p className="relative z-10 text-blue-400 font-black text-[10px] uppercase tracking-[0.4em] mb-4">Cagnotte des Amendes 💸</p>
                        <p className="relative z-10 text-7xl font-black text-white italic tracking-tighter">{data?.cagnotte?.potEur ?? 0}€</p>

                        <div className="relative z-10 mt-8 pt-8 border-t border-white/10">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">🎁 ON PEUT S'OFFRIR...</h4>
                            <div className="bg-white/10 px-6 py-4 rounded-3xl backdrop-blur-md border border-white/10">
                                <p className="text-2xl mb-1">✨</p>
                                <p className="text-white font-black text-lg uppercase tracking-tight">{data?.cagnotte?.currentReward?.label}</p>
                                {data?.cagnotte?.nextReward && (
                                    <p className="text-blue-400 font-bold text-[10px] mt-2 italic uppercase">
                                        Prochain palier : {data.cagnotte.nextReward.label} ({data.cagnotte.nextReward.min}€)
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 font-black text-[10px] text-center uppercase text-gray-400 tracking-widest">Détail des dettes</div>
                        <div className="divide-y divide-gray-50">
                            {(data?.cagnotte?.finesList || []).map(f => (
                                <div key={f.nickname} className="flex justify-between items-center p-5">
                                    <span className="font-black text-gray-800 uppercase text-xs tracking-tighter">{f.nickname}</span>
                                    <span className="font-black text-red-500 bg-red-50 px-4 py-1 rounded-full text-sm">{f.amount}€</span>
                                </div>
                            ))}
                            {(data?.cagnotte?.finesList || []).length === 0 && <p className="text-center py-10 font-black text-gray-300 uppercase italic text-xs leading-relaxed tracking-widest">Tout le monde est à jour. <br /> C'est suspect.</p>}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'trophees' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-baseline justify-between px-2">
                        <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest">Compteur de Gloire</h3>
                        <span className="font-black text-blue-600 text-sm">{(data?.badges?.earned?.trophies?.length || 0) + (data?.badges?.earned?.specialDays?.length || 0)} / {(data?.badges?.earned?.trophies?.length || 0) + (data?.badges?.available?.trophies?.length || 0) + (data?.badges?.earned?.specialDays?.length || 0) + (data?.badges?.available?.specialDays?.length || 0)}</span>
                    </div>

                    {/* 🔥 ACTIVITÉ FEED */}
                    <div className="bg-slate-900 rounded-[2rem] p-6 shadow-xl border border-white/5 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-transparent to-transparent"></div>
                        <h3 className="relative z-10 font-black text-[10px] text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span>🔥</span> Activité Récente
                        </h3>
                        <div className="relative z-10 space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {(data?.badges?.competitive?.events || []).map((ev: any) => (
                                <div key={ev.id} className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-center justify-between gap-3 animate-in slide-in-from-right-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{ev.badge?.emoji}</span>
                                        <div>
                                            <p className="text-[10px] font-black text-white leading-none">
                                                {ev.eventType === 'STEAL' ? (
                                                    <>
                                                        <span className="text-orange-400">{ev.toUser?.nickname}</span> a volé <span className="text-blue-400">[{ev.badge?.name}]</span> à {ev.fromUser?.nickname}
                                                    </>
                                                ) : ev.eventType === 'CLAIM' ? (
                                                    <>
                                                        <span className="text-green-400">{ev.toUser?.nickname}</span> a obtenu <span className="text-blue-400">[{ev.badge?.name}]</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-yellow-400">{ev.toUser?.nickname}</span> a débloqué <span className="text-blue-400">[{ev.badge?.name}]</span>
                                                    </>
                                                )}
                                            </p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">{new Date(ev.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-white">{ev.newValue}</p>
                                        <p className="text-[8px] font-bold text-gray-500 uppercase tracking-tighter">Record</p>
                                    </div>
                                </div>
                            ))}
                            {(data?.badges?.competitive?.events || []).length === 0 && (
                                <p className="text-center py-4 text-gray-500 font-bold text-[10px] uppercase italic tracking-widest">Aucune activité pour le moment</p>
                            )}
                        </div>
                    </div>

                    {/* ⚠️ BADGES EN DANGER */}
                    {(data?.badges?.competitive?.danger || []).length > 0 && (
                        <div className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-6 animate-pulse">
                            <h3 className="font-black text-[10px] text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span>⚠️</span> Badges en danger
                            </h3>
                            <div className="space-y-3">
                                {data.badges.competitive.danger.map((d: any) => (
                                    <div key={d.badgeKey} className="flex items-center justify-between bg-white/80 p-3 rounded-2xl border border-red-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{d.emoji}</span>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-800 uppercase">{d.badgeName}</p>
                                                <p className="text-[8px] font-bold text-gray-500 italic">
                                                    Détenteur: <span className="text-gray-900">{d.holder}</span> ({d.currentValue})
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-red-600 uppercase">Menace: {d.challenger}</p>
                                            <p className="text-[8px] font-bold text-red-400 uppercase tracking-tighter">Écart: {d.diff > 0 ? `-${d.diff}` : 'Égalité'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 🏆 BADGES COMPÉTITIFS (TRANSFÉRABLES) */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6 ml-2">
                            <h3 className="font-black text-[10px] text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">🏆 Badges Compétitifs</h3>
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Détenteur Actuel</span>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {(data?.badges?.competitive?.ownerships || []).filter((bo: any) => bo.badge?.isTransferable).map((bo: any) => (
                                <div key={bo.badgeKey} className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 p-4 rounded-3xl relative overflow-hidden group hover:shadow-md transition-all">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-2xl">{bo.badge?.emoji}</span>
                                            <div className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-lg">{bo.currentValue}</div>
                                        </div>
                                        <p className="text-[9px] font-black text-gray-900 uppercase leading-none mb-1">{bo.badge?.name}</p>
                                        <p className="text-[7.5px] font-bold text-blue-500 uppercase tracking-tighter truncate">👑 {bo.currentUser?.nickname || 'Champion recherché'}</p>
                                    </div>
                                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <span className="text-4xl">{bo.badge?.emoji}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 👑 BADGES UNIQUES (LÉGENDAIRES) */}
                    <div className="bg-slate-50 rounded-[2rem] p-6 border border-gray-200">
                        <h3 className="font-black text-[10px] text-gray-500 uppercase tracking-widest mb-6 ml-2 bg-gray-100 w-fit px-3 py-1 rounded-full flex items-center gap-2">
                            <span>👑</span> Badges Légendaires
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {(data?.badges?.competitive?.ownerships || []).filter((bo: any) => !bo.badge?.isTransferable).map((bo: any) => (
                                <div key={bo.badgeKey} className={`p-4 rounded-3xl border ${bo.locked ? 'bg-white border-yellow-200 shadow-sm' : 'bg-gray-100/50 border-dashed border-gray-300 opacity-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${bo.locked ? 'bg-yellow-50' : 'bg-gray-100'}`}>
                                            {bo.badge?.emoji}
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-gray-800 uppercase leading-none">{bo.badge?.name}</p>
                                            {bo.locked ? (
                                                <p className="text-[8px] font-bold text-yellow-600 uppercase mt-1">Conquis par {bo.currentUser?.nickname}</p>
                                            ) : (
                                                <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 italic">Toujours disponible</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TROPHÉES CLASSIQUES */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                        <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-6 ml-2 bg-gray-50 w-fit px-3 py-1 rounded-full">🎓 Trophées de Milestones</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {(data?.badges?.earned?.trophies || []).map((m: any) => (
                                <div key={m.id} className="flex flex-col items-center gap-2 group">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-white rounded-[2rem] flex items-center justify-center text-3xl border-2 border-blue-100 shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all">{m.emoji}</div>
                                    <div className="text-center px-2">
                                        <p className="text-[9px] font-black text-gray-800 uppercase leading-none mb-1">{m.label}</p>
                                        <p className="text-[7.5px] font-bold text-blue-500 uppercase tracking-tighter truncate max-w-[80px]">{m.winners.join(', ')}</p>
                                    </div>
                                </div>
                            ))}
                            {(data?.badges?.earned?.specialDays || []).map((s: any) => (
                                <div key={s.date} className="flex flex-col items-center gap-2 group">
                                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-50 to-white rounded-[2rem] flex items-center justify-center text-3xl border-2 border-yellow-100 shadow-sm group-hover:scale-110 group-hover:-rotate-3 transition-all">{s.emoji}</div>
                                    <div className="text-center px-2">
                                        <p className="text-[9px] font-black text-gray-800 uppercase leading-none mb-1">{s.label}</p>
                                        <p className="text-[7.5px] font-bold text-yellow-600 uppercase tracking-tighter truncate max-w-[80px]">{s.winners.join(', ')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                        <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-6 ml-2 bg-gray-50 w-fit px-3 py-1 rounded-full">🔓 Autres Trophées</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 grayscale opacity-40">
                            {(data?.badges?.available?.trophies || []).map((m: any) => (
                                <div key={m.id} className="flex flex-col items-center gap-2 opacity-60">
                                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-3xl border-2 border-gray-200">{m.emoji}</div>
                                    <span className="text-[9px] font-black text-gray-400 uppercase text-center">{m.label}</span>
                                </div>
                            ))}
                            {(data?.badges?.available?.specialDays || []).map((s: any) => (
                                <div key={s.date} className="flex flex-col items-center gap-2 opacity-60">
                                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-3xl border-2 border-gray-200">{s.emoji}</div>
                                    <div className="text-center">
                                        <span className="text-[9px] font-black text-gray-400 uppercase">{s.label}</span>
                                        <p className="text-[7.5px] font-bold text-gray-300 uppercase">{s.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] pt-4">Reste focus. La discipline bat le talent.</p>
            {/* KM TAB (Optional) */}
            {activeTab === 'km' && (
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">🏃‍♂️</span>
                        <div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Kilomètres Courus</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase">Débloqué via 1000 Squats</p>
                        </div>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                        <p className="text-sm font-bold text-blue-600 text-center mb-4">Fonctionnalité en cours de déploiement...</p>
                        <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-1/3 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* ZEN TAB (Optional) */}
            {activeTab === 'zen' && (
                <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">🧘‍♀️</span>
                        <div>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Étirements & Zen</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase">Débloqué via 5 Badges</p>
                        </div>
                    </div>
                    <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100">
                        <p className="text-sm font-bold text-purple-600 text-center mb-4">Prenez 10 minutes pour vous étirer aujourd'hui.</p>
                        <button className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl shadow-lg uppercase tracking-widest text-xs">J'AI FAIT MA SÉANCE ZEN</button>
                    </div>
                </div>
            )}

            {/* HONOR POPUP (A12) */}
            {showHonorPopup && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[3rem] p-8 max-w-sm w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="text-center">
                            <span className="text-6xl mb-4 block">🏆</span>
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900">PROUESSE DÉTECTÉE</h2>
                            <p className="text-xs font-bold text-gray-400 uppercase mt-2">Vous êtes sur le point de marquer l'histoire.</p>
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
                            <p className="text-sm text-yellow-800 font-bold leading-relaxed">
                                Je jure sur l'honneur que les répétitions saisies ont été effectuées avec une forme exemplaire.
                            </p>
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={honorChecked}
                                onChange={(e) => setHonorChecked(e.target.checked)}
                                className="w-6 h-6 rounded-lg border-2 border-gray-200 checked:bg-blue-600 transition-all font-black"
                            />
                            <span className="font-bold text-sm text-gray-600 group-hover:text-blue-600 transition-colors uppercase">Je le jure</span>
                        </label>

                        <div className="flex flex-col gap-2">
                            <button
                                onClick={saveLogs}
                                disabled={!honorChecked}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white font-black py-4 rounded-2xl shadow-xl transition-all uppercase tracking-widest text-xs"
                            >
                                Valider la séance
                            </button>
                            <button onClick={() => setShowHonorPopup(null)} className="w-full py-2 text-xs font-bold text-gray-400 uppercase hover:text-gray-600">Annuler</button>
                        </div>
                    </div>
                </div>
            )}

            {/* FOOTER NAV (A5) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 p-2 sm:p-4 z-40 flex justify-around items-center shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <Link href="/" className="flex flex-col items-center gap-1 group">
                    <span className="text-xl group-hover:scale-110 transition-transform">🏠</span>
                    <span className="text-[8px] font-black text-blue-600 uppercase">Home</span>
                </Link>
                <Link href="/leaderboard" className="flex flex-col items-center gap-1 group">
                    <span className="text-xl group-hover:scale-110 transition-transform">📊</span>
                    <span className="text-[8px] font-black text-gray-400 uppercase italic">Rank</span>
                </Link>
                <Link href="/profile" className="flex flex-col items-center gap-1 group">
                    <span className="text-xl group-hover:scale-110 transition-transform">👤</span>
                    <span className="text-[8px] font-black text-gray-400 uppercase italic">Profil</span>
                </Link>
                <Link href="/profile/badges" className="flex flex-col items-center gap-1 group">
                    <span className="text-xl group-hover:scale-110 transition-transform">🎖️</span>
                    <span className="text-[8px] font-black text-gray-400 uppercase italic">Badges</span>
                </Link>
                {(session?.user as any)?.isAdmin && (
                    <Link href="/admin" className="flex flex-col items-center gap-1 group">
                        <span className="text-xl group-hover:scale-110 transition-transform">⚙️</span>
                        <span className="text-[8px] font-black text-red-500 uppercase italic">Admin</span>
                    </Link>
                )}
            </nav>
        </div>
    )
}
