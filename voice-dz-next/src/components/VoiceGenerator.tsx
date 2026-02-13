'use client';

import { useState, useRef } from 'react';
import { Loader2, Play, Download, Mic, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface VoiceOption {
    id: string;
    name: string;
    desc: string;
    icon: string;
    type: 'soft' | 'hype';
}

const VOICES: VoiceOption[] = [
    { id: 'female-dz', name: 'أمينة (Official)', desc: 'فخم، هادئ، إعلاني', icon: '💎', type: 'soft' },
    { id: 'female-dz-hype', name: 'أمينة (Hype)', desc: 'حماسي، سريع، هجومي', icon: '🔥', type: 'hype' },
];

export default function VoiceGenerator() {
    const { user, signInWithGoogle } = useAuth();
    const [text, setText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleGenerate = async () => {
        if (!user) return;
        if (!text.trim()) return;

        setIsLoading(true);
        setAudioUrl(null);
        setError(null);

        try {
            const response = await fetch('/api/generate-speech', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    voice: selectedVoice,
                    userId: user.uid // Use real User ID
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'فشل التوليد');

            // Decode Base64 audio
            const audioBlob = await fetch(`data:audio/wav;base64,${data.audio}`).then(r => r.blob());
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">

            {/* Login Overlay if not authenticated */}
            {!user && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                    <Lock className="w-12 h-12 text-orange-500 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">سجل دخولك للتجربة</h3>
                    <p className="text-gray-300 mb-6 max-w-sm">
                        يجب عليك تسجيل الدخول لحفظ رصيدك وإدارة الملفات الصوتية التي تولدها.
                    </p>
                    <button
                        onClick={signInWithGoogle}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105"
                    >
                        تسجيل الدخول (Google)
                    </button>
                    <p className="mt-4 text-xs text-gray-500">آمن 100% ومجاني للتجربة</p>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl text-white font-medium flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                    توليد الصوت
                </h2>
                <div className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    {text.length} حرف
                </div>
            </div>

            {/* Voice Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {VOICES.map((voice) => (
                    <button
                        key={voice.id}
                        onClick={() => setSelectedVoice(voice.id)}
                        className={`relative group p-4 rounded-2xl border transition-all text-right ${selectedVoice === voice.id
                                ? 'bg-gradient-to-br from-orange-500/20 to-red-600/10 border-orange-500/50 ring-1 ring-orange-500/50'
                                : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                            }`}
                    >
                        {selectedVoice === voice.id && (
                            <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        )}
                        <span className="text-2xl mb-3 block">{voice.icon}</span>
                        <h3 className="text-white font-bold mb-1">{voice.name}</h3>
                        <p className="text-xs text-gray-400">{voice.desc}</p>
                    </button>
                ))}
            </div>

            {/* Text Input */}
            <div className="relative mb-8 group">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="أكتب النص هنا بلهجتك الطبيعية... (جرب: 'شوف خويا، السلعة هذي ما تلقاش كيفها')"
                    className="w-full h-40 bg-[#020617]/50 border border-white/10 rounded-2xl p-5 text-right text-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition resize-none leading-relaxed"
                />
                <div className="absolute bottom-4 left-4 text-gray-500 pointer-events-none">
                    <Mic className="w-4 h-4 opacity-50" />
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={handleGenerate}
                disabled={isLoading || !text.trim() || !user}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] ${isLoading || !text.trim()
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500 shadow-orange-900/20'
                    }`}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري المعالجة...
                    </>
                ) : (
                    <>
                        <Sparkles className="w-5 h-5" />
                        توليد الصوت الآن
                    </>
                )}
            </button>

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-center text-sm">
                    {error}
                </div>
            )}

            {/* Audio Player Result */}
            {audioUrl && (
                <div className="mt-8 animate-fade-in-up">
                    <div className="bg-gradient-to-r from-gray-900 to-black border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                        <button
                            onClick={() => audioRef.current?.play()}
                            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition"
                        >
                            <Play className="w-4 h-4 ml-0.5" />
                        </button>

                        <div className="flex-1 h-8 bg-white/5 rounded-full overflow-hidden flex items-center px-2">
                            {/* Visualizer Placeholder */}
                            <div className="flex gap-0.5 items-end justify-center w-full h-4 opacity-30">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="w-1 bg-orange-500" style={{ height: `${Math.random() * 100}%` }} />
                                ))}
                            </div>
                        </div>

                        <a
                            href={audioUrl}
                            download="voice-dz-audio.wav"
                            className="p-2 text-gray-400 hover:text-white transition"
                        >
                            <Download className="w-5 h-5" />
                        </a>

                        <audio ref={audioRef} src={audioUrl} className="hidden" controls />
                    </div>
                </div>
            )}
        </div>
    );
}
