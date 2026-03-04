import Link from "next/link"
import { ChevronLeft, Zap, Trophy, Shield, Info, HelpCircle } from "lucide-react"

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white border-b sticky top-0 z-10 px-4 py-4 flex items-center justify-between">
                <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft size={24} />
                </Link>
                <h1 className="text-lg font-black uppercase tracking-tighter">Guide & FAQ 📖</h1>
                <div className="w-10"></div>
            </header>

            <main className="max-w-2xl mx-auto p-6 space-y-12">
                {/* Intro Section */}
                <section className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-3xl text-blue-600 mb-2">
                        <HelpCircle size={32} />
                    </div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Comment ça marche ?</h2>
                    <p className="text-gray-600 font-bold leading-relaxed">
                        Bienvenue soldat ! Ici, chaque pompe compte, chaque traction te fait grimper, et chaque squat renforce ta légende. Voici tout ce qu'il faut savoir.
                    </p>
                </section>

                {/* Section XP */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600">
                            <Zap size={20} />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Le Système d'XP</h3>
                    </div>
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-4 text-sm">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 flex-shrink-0 bg-gray-50 rounded-lg flex items-center justify-center font-black text-gray-400">01</div>
                            <p className="text-gray-600 font-bold">
                                <span className="text-gray-900 block font-black">L'effort de base</span>
                                Chaque répétition validée te rapporte de l'XP de base. C'est le socle de ta progression.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 flex-shrink-0 bg-gray-50 rounded-lg flex items-center justify-center font-black text-gray-400">02</div>
                            <p className="text-gray-600 font-bold">
                                <span className="text-gray-900 block font-black">Le Bonus "Flex"</span>
                                Si tu dépasses ta cible journalière, tu gagnes des bonus exponentiels. Plus tu "flex", plus tu décolles !
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 flex-shrink-0 bg-gray-50 rounded-lg flex items-center justify-center font-black text-gray-400">03</div>
                            <p className="text-gray-600 font-bold">
                                <span className="text-gray-900 block font-black">La Valeur Temporelle</span>
                                Les récompenses sont indexées sur le temps. Un badge gagné en période de haute compétition (comme décembre) rapporte plus qu'en période calme.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Section Niveaux / Animaux */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-xl text-green-600">
                            <Shield size={20} />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Rangs & Animaux</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                            <div className="text-4xl">🦠</div>
                            <div>
                                <span className="block font-black text-xs text-gray-400 uppercase tracking-widest">Niveau 1-10</span>
                                <h4 className="font-black text-lg text-gray-900">Les Micro-Organismes</h4>
                                <p className="text-xs font-bold text-gray-500 mt-1">
                                    Tardigrades, Amibes... Tu commences petit, mais tu es increvable.
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                            <div className="text-4xl">🦊</div>
                            <div>
                                <span className="block font-black text-xs text-gray-400 uppercase tracking-widest">Niveau 30-50</span>
                                <h4 className="font-black text-lg text-gray-900">Les Prédateurs</h4>
                                <p className="text-xs font-bold text-gray-500 mt-1">
                                    Renards, Loups... Tu as du flair et tu ne lâches jamais ta proie.
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center gap-6">
                            <div className="text-4xl">🦖</div>
                            <div>
                                <span className="block font-black text-xs text-gray-400 uppercase tracking-widest">Niveau 80+</span>
                                <h4 className="font-black text-lg text-gray-900">Les Légendes</h4>
                                <p className="text-xs font-bold text-gray-500 mt-1">
                                    Dragons, Rorquals Bleus... Tu es au sommet de la chaîne alimentaire.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section Badges */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
                            <Trophy size={20} />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Types de Badges</h3>
                    </div>
                    <div className="space-y-4 font-bold text-sm">
                        <div className="bg-white rounded-3xl p-5 border border-purple-50 shadow-sm flex items-start gap-4">
                            <div className="text-2xl">🔥</div>
                            <div>
                                <p className="text-gray-900 font-black">Badges Compétitifs</p>
                                <p className="text-gray-500 text-xs">Ces badges peuvent être VOLÉS par d'autres joueurs s'ils battent ton record. Sois vigilant !</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-3xl p-5 border border-purple-50 shadow-sm flex items-start gap-4">
                            <div className="text-2xl">🏆</div>
                            <div>
                                <p className="text-gray-900 font-black">Badges Milestones</p>
                                <p className="text-gray-500 text-xs">Ces badges sont à toi pour toujours. Ils marquent tes progrès personnels (ex: 1000 pompes totales).</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-3xl p-5 border border-purple-50 shadow-sm flex items-start gap-4">
                            <div className="text-2xl">📅</div>
                            <div>
                                <p className="text-gray-900 font-black">Badges Événements</p>
                                <p className="text-gray-500 text-xs">Des badges rares liés à des dates spéciales (Noël, Saint-Patrick, 1er Avril). Ne les rate pas !</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ Questions */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                            <Info size={20} />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">Questions Fréquentes</h3>
                    </div>
                    <div className="space-y-4">
                        <details className="group bg-white rounded-3xl border border-gray-100 overflow-hidden">
                            <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                <span className="font-black text-gray-900 text-sm italic">Puis-je perdre mon XP ?</span>
                                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-6 pb-6 text-gray-600 text-xs font-bold">
                                Non, ton XP accumulée est définitive. Cependant, si tu supprimes une série validée par erreur, l'XP correspondante sera retirée.
                            </div>
                        </details>
                        <details className="group bg-white rounded-3xl border border-gray-100 overflow-hidden">
                            <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                <span className="font-black text-gray-900 text-sm italic">C'est quoi le "Mood" ?</span>
                                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-6 pb-6 text-gray-600 text-xs font-bold">
                                C'est un micro-message (50 car.) éphémère qui dure 24h. Tu peux le mettre à jour à chaque séance pour dire comment tu te sens. Tes potes peuvent le liker sur la Place publique !
                            </div>
                        </details>
                        <details className="group bg-white rounded-3xl border border-gray-100 overflow-hidden">
                            <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                                <span className="font-black text-gray-900 text-sm italic">Où sont passés mes badges ?</span>
                                <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="px-6 pb-6 text-gray-600 text-xs font-bold">
                                Si un badge compétitif n'est plus dans ton profil, c'est qu'un autre utilisateur l'a récupéré en faisant mieux que toi. Va voir l'activité récente pour savoir qui t'a doublé !
                            </div>
                        </details>
                    </div>
                </section>

                <footer className="text-center pt-8">
                    <Link
                        href="/"
                        className="inline-block bg-slate-900 text-white font-black px-8 py-4 rounded-2xl uppercase tracking-widest text-xs hover:scale-105 transition-transform"
                    >
                        Retour au Front 🫡
                    </Link>
                </footer>
            </main>
        </div>
    )
}
