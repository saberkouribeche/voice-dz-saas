import VoiceGenerator from '@/components/VoiceGenerator';
import { Sparkles, Globe } from 'lucide-react';
import Navbar from '@/components/Navbar';
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

      <Navbar />

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

