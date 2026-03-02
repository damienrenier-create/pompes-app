"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useEffect } from "react"
import { Home, BarChart2, Euro, Trophy, Users, Award, User, LogOut, Camera, ShieldCheck, LayoutDashboard } from "lucide-react"

export default function Navbar() {
    const { data: session } = useSession()

    useEffect(() => {
        if (session?.user?.expired) {
            signOut({ callbackUrl: "/login?expired=true" })
        }
    }, [session])

    return (
        <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
                            <div className="p-2 bg-blue-600 rounded-xl text-white group-hover:bg-blue-700 transition-colors shadow-sm">
                                <Home size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
                                Pompes entre potes
                            </span>
                        </Link>

                        {session && (
                            <div className="hidden lg:flex items-center gap-1">
                                <Link
                                    href="/?tab=saisie"
                                    className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 font-bold px-3 py-2 rounded-xl transition-all text-xs uppercase tracking-wider"
                                >
                                    <LayoutDashboard size={14} />
                                    Saisie
                                </Link>
                                <Link
                                    href="/?tab=graphs"
                                    className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 font-bold px-3 py-2 rounded-xl transition-all text-xs uppercase tracking-wider"
                                >
                                    <BarChart2 size={14} />
                                    Graphs
                                </Link>
                                <Link
                                    href="/?tab=cagnotte"
                                    className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 font-bold px-3 py-2 rounded-xl transition-all text-xs uppercase tracking-wider"
                                >
                                    <Euro size={14} />
                                    Cagnotte
                                </Link>
                                <Link
                                    href="/trophies"
                                    className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 font-bold px-3 py-2 rounded-xl transition-all text-xs uppercase tracking-wider"
                                >
                                    <Trophy size={14} />
                                    Trophées
                                </Link>
                                <div className="h-4 w-[1px] bg-gray-100 mx-2" />
                                <Link
                                    href="/leaderboard"
                                    className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 font-bold px-3 py-2 rounded-xl transition-all text-xs uppercase tracking-wider"
                                >
                                    <Users size={14} />
                                    Leaderboard
                                </Link>
                                <Link
                                    href="/profile/badges"
                                    className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 font-bold px-3 py-2 rounded-xl transition-all text-xs uppercase tracking-wider"
                                >
                                    <Award size={14} />
                                    Badges
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        {session ? (
                            <>
                                <a
                                    href="https://photos.app.goo.gl/FrtN2kjDRY8vGQVP6"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden md:flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold px-4 py-2 rounded-xl transition-all text-xs border border-indigo-100"
                                >
                                    <Camera size={14} />
                                    Album
                                </a>
                                {(session?.user as any)?.isAdmin && (
                                    <Link
                                        href="/admin"
                                        className="hidden xl:flex items-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 font-bold px-4 py-2 rounded-xl transition-all text-xs border border-red-100"
                                    >
                                        <ShieldCheck size={14} />
                                        Admin
                                    </Link>
                                )}
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-2 bg-gray-50 text-gray-600 hover:bg-gray-100 font-bold px-4 py-2 rounded-xl transition-all text-xs border border-gray-100"
                                >
                                    <User size={14} />
                                    <span className="hidden sm:inline">Profil</span>
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-gray-100"
                                    title="Déconnexion"
                                >
                                    <LogOut size={18} />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md transition-colors text-sm"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    href="/register"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                                >
                                    S'inscrire
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                {/* Mobile Extra Links (Optimized) */}
                {session && (
                    <div className="flex sm:hidden border-t border-gray-100 py-3 overflow-x-auto no-scrollbar gap-2 bg-gray-50/50 -mx-4 px-4">
                        <Link href="/?tab=saisie" className="flex items-center gap-1.5 whitespace-nowrap bg-white border border-gray-200 text-gray-600 font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider shadow-sm transition-all hover:border-blue-300">
                            <LayoutDashboard size={12} />
                            Saisie
                        </Link>
                        <Link href="/?tab=graphs" className="flex items-center gap-1.5 whitespace-nowrap bg-white border border-gray-200 text-gray-600 font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider shadow-sm transition-all hover:border-blue-300">
                            <BarChart2 size={12} />
                            Graphs
                        </Link>
                        <Link href="/?tab=cagnotte" className="flex items-center gap-1.5 whitespace-nowrap bg-white border border-gray-200 text-gray-600 font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider shadow-sm transition-all hover:border-blue-300">
                            <Euro size={12} />
                            Cagnotte
                        </Link>
                        <Link href="/trophies" className="flex items-center gap-1.5 whitespace-nowrap bg-white border border-gray-200 text-gray-600 font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider shadow-sm transition-all hover:border-blue-300">
                            <Trophy size={12} />
                            Trophées
                        </Link>
                        <div className="w-[1px] bg-gray-200 mx-1" />
                        <Link href="/leaderboard" className="flex items-center gap-1.5 whitespace-nowrap bg-white border border-gray-200 text-gray-600 font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider shadow-sm transition-all hover:border-blue-300">
                            <Users size={12} />
                            Leaderboard
                        </Link>
                        <Link href="/profile/badges" className="flex items-center gap-1.5 whitespace-nowrap bg-white border border-gray-200 text-gray-600 font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider shadow-sm transition-all hover:border-blue-300">
                            <Award size={12} />
                            Badges
                        </Link>
                        <a href="https://photos.app.goo.gl/FrtN2kjDRY8vGQVP6" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 whitespace-nowrap bg-indigo-50 border border-indigo-100 text-indigo-600 font-bold px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider shadow-sm transition-all hover:bg-indigo-100">
                            <Camera size={12} />
                            Album
                        </a>
                    </div>
                )}
            </div>
        </nav>
    )
}
