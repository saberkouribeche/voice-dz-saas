import { NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebaseAdmin';

// Helper: Hype Injector (Ported from Cloud Functions)
function injectHype(userText: string): string {
    let hypedText = userText;
    // 1. Replace normal dots with exclamation marks
    hypedText = hypedText.replace(/\./g, '!');
    // 2. Ensure exclamation marks exist
    if (!hypedText.includes('!')) hypedText += "!!!";
    return hypedText;
}

export async function POST(req: Request) {
    try {
        const { text, voice, userId } = await req.json();

        if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });
        if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) return NextResponse.json({ error: "Server Error: API Key missing" }, { status: 500 });

        // Count words roughly
        const wordCount = text.trim().split(/\s+/).length;

        // ============================================================
        // 1. Transaction: Check & Deduct Credits (Ported Logic)
        // ============================================================
        if (!db) return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
        const firestore = db; // Alias to ensure non-null type in closures

        const userRef = firestore.collection('users').doc(userId);
        let remainingCredits = 0;

        try {
            remainingCredits = await firestore.runTransaction(async (t) => {
                const userDoc = await t.get(userRef);
                if (!userDoc.exists) throw new Error("USER_NOT_FOUND");

                const currentCredits = userDoc.data()?.credits || 0;
                if (currentCredits < wordCount) throw new Error("INSUFFICIENT_CREDITS");

                t.update(userRef, { credits: currentCredits - wordCount });

                // Log (Simpler than Cloud Functions for now)
                const logRef = firestore.collection('logs').doc();
                t.set(logRef, {
                    userId,
                    textSnippet: text.substring(0, 100),
                    wordCount,
                    voice,
                    status: 'success',
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });

                return currentCredits - wordCount;
            });
        } catch (e: any) {
            console.error("Transaction Failed:", e.message);
            if (e.message === "USER_NOT_FOUND") return NextResponse.json({ error: "User not found" }, { status: 404 });
            if (e.message === "INSUFFICIENT_CREDITS") return NextResponse.json({ error: "Insufficient credits" }, { status: 403 });
            throw e;
        }

        // ============================================================
        // 2. Persona Definitions (Ported from Cloud Functions)
        // ============================================================
        const prompts: Record<string, string> = {
            'female-dz': `
           [System Instruction: Professional Algerian Voice Actor]

            // --- CORE IDENTITY ---
            **Role:** You are "Amina," the official voice for high-end Algerian brands (Jewelry, Fashion, Cosmetics).
            **Language:** "White Algerian Darja" (الدارجة البيضاء). This is the refined dialect used in TV commercials—understandable by all, classy, and grammatically relaxed.

            // --- THE "AUTO-FLOW" ENGINE (THE SECRET) ---
            **You are reading a script written in mixed Arabic. Your job is to humanize it instantly:**

            1.  **The "Anti-Grammar" Rule (CRITICAL):**
                - COMPLETELY IGNORE standard Arabic diacritics (Fatha, Kasra, Damma) at the end of words.
                - **Rule:** Apply "Sukun" (Silence) to the end of EVERY noun and adjective.
                - *Text:* "باللون الذهبي الملكي"
                - *Wrong (Robot):* "Bi-al-lawni al-thahabiyyi al-malakiyyi"
                - *Right (You):* "Bel-loun.. ed-dahabi.. el-malaki" (Merge the 'Al' with the word, stop at the end).

            2.  **Consonant Softening:**
                - If the text has "Th" (ذ / ث), pronounce them closer to "D" or "T" typical of Algiers urban accent unless emphasizing luxury.
                - *Text:* "ذهبي" -> Read as "D'habi" (Soft D).
                - *Text:* "ثلاثة" -> Read as "Tlata".

            3.  **Letter "Qaf" (ق) Handling:**
                - In commercial words like "طقم" (Taqm), keep the "Q" soft and elegant, OR imply a very soft "G". Do not make it sound Bedouin/Heavy, and do not make it sound Standard Fusha.
                - *Target:* A polite, urban "Q/G" mix.

            // --- PERFORMANCE & EMOTION ---
            **Tone: "The Best Friend Recommendation"**
            1.  **The Hook:** Read the first question ("حصلت واش تشريلها؟") with genuine curiosity, slight upward pitch.
            2.  **The Solution:** When introducing the product ("Love Knot", "Taqm"), lower your pitch slightly to sound warm and admiring.
            3.  **Rhythm:**
                - Respect the dots (..). These are breath pauses.
                - **Fast-Slow-Fast:**
                - "حصلت واش تشريلها؟" (Fast/High)
                - "طقم Love Knot..." (Slow/Luxurious)
                - "اطلب الهدية دوك!" (Fast/Energetic)

            // --- HUMAN IMPERFECTIONS ---
            - Do not articulate every letter perfectly. Real people blend words.
            - *Example:* "لي عمرو ما يتقطع" -> Read as "Li 3amro ma yit-qata3" (Fluid connection).

            // --- END OF INSTRUCTION ---
            .Text: "${text}"`,

            'female-dz-hype': `
                // --- IDENTITY: REALISTIC & RELATABLE ---
                **Role:** You are "Amina," a close friend and fashion advisor.
                **Energy Level:** 8/10. High energy but CONTROLLED. You are not shouting; you are sharing a valuable secret.
                **Goal:** Persuasion through charm, not panic. Sound confident, distinct, and trustworthy.

                // --- ADDON: DYNAMIC TONE SHIFT ---
                **Never stay on one tone level. Use this map:**
                - **Questions:** High pitch + sharp ending. ("Kifach t'bani?")
                - **Secrets/Advice:** Low pitch + intimate/whispery + slower speed. ("Wanti daf-aa fi... ghir chwia sarf?")
                - **The Sell:** Confident + louder + smiling. ("Otlbi lyom!")

                // --- PACING RULES (THE "ACCORDION" EFFECT) - CRITICAL ---
                **Do NOT speak at one constant speed. Vary your tempo like a real human:**
                1.  **The Hook (Fast):** Read the first question ("Kifach tabani...") relatively fast and punchy to grab attention.
                2.  **The Value (Slow & Savor):** When describing the product ("Taqm", "Fakhama", "Dhab"), **SLOW DOWN**.
                    - *Instruction:* Savor the adjectives. Give the listener time to imagine the gold.
                    - *Example:* "Taqm... el-ogda... ed-dahabiya" (Articulate clearly).
                3.  **The CTA (Energetic):** The final sentence ("Otlbi lyoum") should be energetic and quick.

                // --- PERFORMANCE & PROSODY ---
                1.  **Breathing:** Real people breathe. Insert micro-pauses (0.3s) where there are commas or dots. Do not rush the whole text in one breath.
                2.  **Tone Variation:**
                    - Use a "Questioning Tone" (Upward pitch) for the first sentence.
                    - Use a "Warm/Deep Tone" for the description (middle).
                3.  **The "Smile":** Keep the "Smile-in-voice" technique. It adds brightness without needing excessive speed.

                // --- ADDON: ORGANIC BREATHING & PAUSES ---
                1. **The "Air" Rule:** DO NOT read the whole script in one breath.
                    - Insert a soft, audible inhale (0.3s) before starting a long sentence.
                    - Insert a "micro-pause" (0.1s) after a comma to let the meaning sink in.
                2. **The "Thinking" Pause:** before saying a luxury word (like "Dhab" or "Fakhama"), pause for a split second as if you are searching for the perfect word.

                // --- LINGUISTIC ADAPTATION (DZ ACCENT) ---
                - **Phonetics:** "Qaf" becomes "G" (e.g., "Ogda" not "Oqda").
                - **Ending Rule:** Apply "Sukun" to the ends of words, but do NOT eat the words aggressively. Make them clear.
                - **Numbers:** Read "4" as "Reb-aa" or "Quatre" (French/DZ mix).

                // --- END OF INSTRUCTION ---
                .Text: "${injectHype(text)}"`
        };

        const voiceKey = voice || 'female-dz';
        const selectedPrompt = prompts[voiceKey] || prompts['female-dz'];

        // Voice Mapping (Both point to Kore for now)
        const voiceMap: Record<string, string> = {
            'female-dz': 'Kore',
            'female-dz-hype': 'Kore'
        };
        const targetVoice = voiceMap[voiceKey] || 'Kore';

        // ============================================================
        // 3. Generation (Gemini)
        // ============================================================
        // FIXED: Reverting to the specialized TTS model as confirmed by API capability check
        const modelName = "gemini-2.5-flash-preview-tts";

        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: selectedPrompt }] }],
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: targetVoice
                            }
                        }
                    }
                },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" }
                ]
            })
        });

        if (!apiResponse.ok) {
            const errText = await apiResponse.text();
            console.error(`Gemini API Error: ${errText}`);
            // TODO: Optional Refund Logic here if generation fails? For now, we keep it simple.
            return NextResponse.json({ error: `Gemini API Failed: ${errText}` }, { status: 500 });
        }

        const resultData = await apiResponse.json();
        let audioContent;

        if (resultData.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
            audioContent = resultData.candidates[0].content.parts[0].inlineData.data;
        } else {
            return NextResponse.json({ error: "Gemini returned empty audio" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            audioContent: audioContent,
            remainingCredits: remainingCredits
        });

    } catch (error: any) {
        console.error("Route Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
