import VoiceGenerator from '@/components/VoiceGenerator';
import { Sparkles, Menu, X, Globe, User } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] relative overflow-x-hidden selection:bg-orange-500/30 selection:text-orange-200">

      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-900/10 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]"></div>
      </div>

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
            <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-white transition border border-white/5">
              <User className="w-4 h-4" />
              <span>حسابي</span>
            </button>
          </div>

          {/* Mobile Menu Button (Placeholder) */}
          <button className="md:hidden p-2 text-gray-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        {/* Responsive Hero */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs md:text-sm font-medium mb-6 animate-fade-in-up">
            <Sparkles className="w-3 h-3" />
            <span>النسخة الاحترافية v2.0</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-tight">
            <span className="block text-white">صوت جزائري</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-600">
              احترافي وواقعي
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto leading-relaxed mb-8">
            حول نصوصك إلى تعليق صوتي باللهجة الجزائرية الحقيقية.
            <br className="hidden md:block" />
            مثالي للإعلانات، السوشيال ميديا، والمحتوى الفيروسي.
          </p>
        </div>

        {/* Generator App Container */}
        <div className="max-w-4xl mx-auto">
          <VoiceGenerator />
        </div>
      </div>
    </main>
  );
}

