// js/voice-service.js
import { auth } from './firebase-config.js';

// 1. بيانات المعلقين - محدثة لاستخدام Google Text-to-Speech
// 1. بيانات المعلقين - تم الحذف والإبقاء على أمينة فقط (الأكثر احترافية)
export const voicesData = [
    { id: 'female-dz', name: 'أمينة (Official)', type: 'إعلاني ناعم', desc: 'فخم، هادئ، احترافي', icon: '💎', gender: 'female' },
    { id: 'female-dz-hype', name: 'أمينة (Hype)', type: 'إعلاني شرس', desc: 'حماسي، سريع، هجومي', icon: '🔥', gender: 'female' }
];

// 2. مشغل العينات الصوتية
let currentAudio = null;

export function playVoiceSample(voiceId, onStart, onEnd, onError) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    const audioPath = `samples/${voiceId}.wav`;
    currentAudio = new Audio(audioPath);

    currentAudio.play()
        .then(() => onStart())
        .catch((err) => onError(err));

    currentAudio.onended = () => onEnd();
}

// 3. دوال مساعدة لتحويل الصوت (WAV Helpers)
function base64ToUint8Array(base64) {
    const cleanBase64 = base64.replace(/[\r\n\s]/g, '');
    const binaryString = window.atob(cleanBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

function createWavHeader(dataLength, sampleRate = 24000) {
    const numChannels = 1;
    const bitsPerSample = 16;
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    const writeString = (view, offset, string) => {
        for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
    view.setUint16(32, numChannels * (bitsPerSample / 8), true);
    view.setUint16(34, bitsPerSample, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    return header;
}

// 4. الدالة الرئيسية للتوليد (Calling API)
export async function generateAudioFromText(text, voiceId) {
    const user = auth.currentUser;
    if (!user) throw new Error("يجب تسجيل الدخول أولاً");

    // رابط السيرفر الخاص بك
    const functionUrl = "https://generatevoicesecure-b2cehk5zia-uc.a.run.app";

    const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            text: text,
            voice: voiceId,
            userId: user.uid
        })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'فشل التوليد');

    const audioBytes = base64ToUint8Array(data.audioContent);
    let finalBlob;

    // Smart Format Detection
    const isMp3 = audioBytes.length > 1 && audioBytes[0] === 0xFF && (audioBytes[1] & 0xE0) === 0xE0;

    // Check key bytes for RIFF header (WAV)
    const isRiff = audioBytes.length > 11 &&
        audioBytes[0] === 0x52 && // R
        audioBytes[1] === 0x49 && // I
        audioBytes[2] === 0x46;   // F

    if (isMp3) {
        console.log("Detected MP3 Format (Google TTS)");
        finalBlob = new Blob([audioBytes], { type: 'audio/mpeg' });
    } else if (isRiff) {
        console.log("Detected WAV Format (Probably Google TTS / Gemini with header)");
        finalBlob = new Blob([audioBytes], { type: 'audio/wav' });
    } else {
        console.log("Detected RAW PCM (Gemini) -> Adding WAV Header");
        const wavHeader = createWavHeader(audioBytes.length, 24000);
        finalBlob = new Blob([wavHeader, audioBytes], { type: 'audio/wav' });
    }

    return URL.createObjectURL(finalBlob);
}