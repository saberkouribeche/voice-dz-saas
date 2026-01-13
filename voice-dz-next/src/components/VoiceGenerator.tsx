
'use client';

import { useState, useRef } from 'react';
import { Loader2, Play, Download, Mic, Sparkles } from 'lucide-react';

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
    const [text, setText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Temporary User ID simulation
    const TEMP_USER_ID = "guest_v2";

    const handleGenerate = async () => {
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
                    userId: TEMP_USER_ID
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate speech');
            }

            // Process Audio (Base64 -> Blob)
            const binaryString = window.atob(data.audioContent);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Add WAV Header Logic (Simple version for 24kHz Mono 16-bit PCM)
            // Note: In a real prod app, we should parse the header properly.
            // For Gemini, it usually needs a header if raw.
            // But the API route sends raw. Let's wrap it simple or rely on browser.
            // Actually, Gemini 2.5/2.0 returns RAW PCM usually.
            // Let's assume the previous logic (WAV Header addition) is needed here or do it client side.
            // For now, let's create a WAV blob assuming 24khz.

            const wavHeader = createWavHeader(bytes.length, 24000);
            const finalBlob = new Blob([wavHeader, bytes], { type: 'audio/wav' });
            const url = URL.createObjectURL(finalBlob);

            setAudioUrl(url);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "حدث خطأ غير متوقع");
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to create WAV header for Gemini PCM
    function createWavHeader(dataLength: number, sampleRate: number) {
        const buffer = new ArrayBuffer(44);
        const view = new DataView(buffer);

        // RIFF identifier
        writeString(view, 0, 'RIFF');
        // RIFF chunk length
        view.setUint32(4, 36 + dataLength, true);
        // WAVE identifier
        writeString(view, 8, 'WAVE');
        // fmt chunk identifier
        writeString(view, 12, 'fmt ');
        // fmt chunk length
        view.setUint32(16, 16, true);
        // Sample format (1 is PCM)
        view.setUint16(20, 1, true);
        // Stereo (1 channel)
        view.setUint16(22, 1, true);
        // Sample rate
        view.setUint32(24, sampleRate, true);
        // Byte rate (SampleRate * BlockAlign)
        view.setUint32(28, sampleRate * 2, true);
        // Block align (Channel * BytesPerSample)
        view.setUint16(32, 2, true);
        // Bits per sample
        view.setUint16(34, 16, true);
        // data chunk identifier
        writeString(view, 36, 'data');
        // data chunk length
        view.setUint32(40, dataLength, true);

        return buffer;
    }

    function writeString(view: DataView, offset: number, string: string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    return (
        <div className="w-full mx-auto p-4 md:p-6 bg-[#0f172a]/50 backdrop-blur-3xl rounded-3xl border border-white/5 shadow-2xl">

            {/* Voice Selection - Mobile Scroll / Desktop Grid */}
            <div className="mb-8">
                <label className="text-gray-400 text-sm font-medium mb-3 block">اختر الشخصية المناسبة:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {VOICES.map((v) => (
                        <button
                            key={v.id}
                            onClick={() => setSelectedVoice(v.id)}
                            className={`relative group p-4 rounded-xl text-right transition-all duration-300 border overflow-hidden ${selectedVoice === v.id
                                ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.1)]'
                                : 'border-white/5 bg-slate-800/20 hover:border-white/20 hover:bg-slate-800/50'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="text-4xl filter drop-shadow-lg">{v.icon}</div>
                                {selectedVoice === v.id && <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_orange]"></div>}
                            </div>
                            <div className="font-bold text-lg text-white group-hover:text-orange-100 transition">{v.name}</div>
                            <div className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">{v.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Input Area - Focus & Autosize */}
            <div className="relative group mb-8">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500 pointer-events-none"></div>
                <div className="relative bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">

                    {/* Header / Tools (Placeholder) */}
                    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Mic className="w-3 h-3" />
                            المساعد الذكي
                        </span>
                        <span className={`text-xs ${text.length > 200 ? 'text-orange-500' : 'text-gray-500'}`}>
                            {text.length} حرف
                        </span>
                    </div>

                    <textarea
                        dir="rtl"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="أكتب النص هنا بلهجتك الطبيعية... (جرب: 'شوف خويا، السلعة هذي ما تلقاش كيفها')"
                        className="w-full h-48 bg-transparent p-4 text-lg text-white placeholder-gray-600 focus:outline-none focus:bg-white/[0.02] transition resize-none leading-relaxed"
                    />
                </div>
            </div>

            {/* Action Button - Mobile Fixed Bottom or Desktop Normal */}
            <button
                onClick={handleGenerate}
                disabled={isLoading || !text}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg md:text-xl group"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin w-6 h-6" />
                        <span className="animate-pulse">يتم تحضير الصوت...</span>
                    </>
                ) : (
                    <>
                        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition" />
                        توليد الصوت الآن
                    </>
                )}
            </button>

            {/* Error Message */}
            {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl text-center text-sm animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            {/* Audio Player - Enhanced Visualization */}
            {audioUrl && (
                <div className="mt-8 bg-black/40 border border-white/10 p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-6 backdrop-blur-md">
                    <div className="text-xs text-gray-500 mb-3 text-center">تم التوليد بنجاح ✅</div>
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={() => {
                                if (audioRef.current) {
                                    audioRef.current.currentTime = 0;
                                    audioRef.current.play();
                                }
                            }}
                            className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-100 hover:scale-105 transition shadow-lg shadow-white/10"
                        >
                            <Play className="w-6 h-6 ml-1 fill-black" />
                        </button>

                        {/* Visualizer Placeholder */}
                        <div className="flex-1 h-12 flex items-center gap-1 justify-center px-4 bg-white/5 rounded-xl border border-white/5">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="w-1 bg-orange-500/50 rounded-full animate-pulse" style={{ height: Math.random() * 100 + '%', animationDelay: `${i * 0.1}s` }}></div>
                            ))}
                        </div>

                        <a
                            href={audioUrl}
                            download={`voice-dz-${Date.now()}.wav`}
                            className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition border border-white/5"
                        >
                            <Download className="w-6 h-6" />
                        </a>
                    </div>

                    <audio
                        ref={audioRef}
                        src={audioUrl}
                        className="hidden"
                        controls
                        autoPlay
                    />
                </div>
            )}
        </div>
    );
}

