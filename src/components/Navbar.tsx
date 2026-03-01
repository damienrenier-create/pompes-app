"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useEffect } from "react"

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
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Pompes entre potes
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-1 sm:space-x-4">
                        {session ? (
                            <>
                                <Link
                                    href="/leaderboard"
                                    className="hidden sm:block text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md transition-colors text-sm"
                                >
                                    Leaderboard
                                </Link>
                                <Link
                                    href="/profile/badges"
                                    className="hidden sm:block text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md transition-colors text-sm"
                                >
                                    Mes Badges
                                </Link>
                                <Link
                                    href="/profile"
                                    className="text-gray-600 hover:text-blue-600 font-medium px-3 py-2 rounded-md transition-colors text-sm"
                                >
                                    Mon Profil
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors"
                                >
                                    Déconnexion
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
                {/* Mobile Extra Links (simplified) */}
                {session && (
                    <div className="flex sm:hidden border-t border-gray-50 py-2 overflow-x-auto no-scrollbar">
                        <Link href="/leaderboard" className="whitespace-nowrap text-gray-500 hover:text-blue-600 font-medium px-4 py-1 text-xs transition-colors">
                            Leaderboard
                        </Link>
                        <Link href="/profile/badges" className="whitespace-nowrap text-gray-500 hover:text-blue-600 font-medium px-4 py-1 text-xs transition-colors">
                            Mes Badges
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    )
}
