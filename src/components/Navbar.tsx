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

    if (!session) return null

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
                    <div className="flex items-center space-x-4">
                        <Link href="/profile" className="text-gray-600 hover:text-gray-900 font-medium px-3 py-2 rounded-md transition-colors">
                            Profil ({session.user?.name})
                        </Link>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                        >
                            Déconnexion
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
