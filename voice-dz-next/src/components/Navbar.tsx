"use client";

import Link from 'next/link';
import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const { user, signInWithGoogle, logout } = useAuth();

    return (
        <nav className="relative z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md sticky top-0">
            <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20">
                        V
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">Voice<span className="text-orange-500">DZ</span></span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <Link href="#" className="hover:text-white transition">الرئيسية</Link>
                    <Link href="#" className="hover:text-white transition">الميزات</Link>
                    <Link href="#" className="hover:text-white transition">الأسعار</Link>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-white">
                                <img
                                    src={user.photoURL || ''}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full border border-white/10"
                                />
                                <span className="text-xs">{user.displayName}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 hover:bg-white/10 rounded-full text-red-400 transition"
                                title="تسجيل الخروج"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={signInWithGoogle}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-white transition border border-white/5"
                        >
                            <User className="w-4 h-4" />
                            <span>دخول / تسجيل</span>
                        </button>
                    )}
                </div>

                {/* Mobile Menu Button (Placeholder) */}
                <button className="md:hidden p-2 text-gray-400 hover:text-white">
                    <Menu className="w-6 h-6" />
                </button>
            </div>
        </nav>
    );
}
