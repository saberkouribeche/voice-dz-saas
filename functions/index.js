/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const cors = require('cors')({ origin: true });
const { defineSecret } = require('firebase-functions/params');

admin.initializeApp();
const db = admin.firestore();

// تعريف المفتاح السري (يجب رفعه عبر الأمر: firebase functions:secrets:set GEMINI_API_KEY)
const apiKeySecret = defineSecret('GEMINI_API_KEY');

exports.generateVoiceSecure = onRequest({
    region: "us-central1",
    secrets: [apiKeySecret], // السماح للدالة بالوصول للمفتاح
    timeoutSeconds: 60,      // مهلة زمنية كافية لتوليد الصوت
    memory: "512MiB",        // ذاكرة مناسبة للمعالجة
    maxInstances: 10         // تحديد عدد النسخ لتجنب الفواتير المفاجئة
}, (req, res) => {
    cors(req, res, async () => {
        // رفض أي طلب غير POST
        if (req.method !== 'POST') {
            return res.status(405).send('Method Not Allowed');
        }

        try {
            const { text, voice, userId } = req.body;
            const GEMINI_API_KEY = apiKeySecret.value();

            // 1. التحقق من صحة البيانات المدخلة
            if (!text || !userId) {
                return res.status(400).json({ error: "البيانات ناقصة: النص أو معرف المستخدم مفقود" });
            }

            // حساب عدد الكلمات التقريبي
            const wordCount = text.trim().split(/\s+/).length;

            // 2. التحقق الأولي من الرصيد (قراءة فقط لتوفير التكلفة والوقت)
            const userRef = db.collection('users').doc(userId);
            const userSnapshot = await userRef.get();

            if (!userSnapshot.exists) {
                return res.status(404).json({ error: "المستخدم غير موجود" });
            }

            const userData = userSnapshot.data();
            const currentCredits = userData.credits || 0;

            // Allow if user has credits OR if credits are undefined (first time) - assuming default to 0 in logic usually, but here strict check
            if (currentCredits < wordCount) {
                return res.status(403).json({ error: "عذراً، رصيدك لا يكفي لإتمام العملية." });
            }

            // ============================================================
            // 3. هندسة الشخصيات الجزائرية (تم تحسين النص لضمان الجودة)
            // ============================================================
            // ============================================================
            // 3. هندسة الشخصيات الجزائرية (تم تحسين النص لضمان الجودة)
            // ============================================================

            // Helper: Hype Injector
            function injectHype(userText) {
                let hypedText = userText;
                // 1. استبدال النقاط العادية بعلامات تعجب
                hypedText = hypedText.replace(/\./g, '!');
                // 2. ضمان وجود علامات التعجب
                if (!hypedText.includes('!')) hypedText += "!!!";
                return hypedText;
            }

            const prompts = {
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

            const selectedPrompt = prompts[voice] || prompts['female-dz'];

            const voiceMap = {
                'female-dz': 'Kore',
                'female-dz-hype': 'Kore'
            };

            // Explicitly check for 'amina' or defaults
            let targetVoice = voiceMap[voice] || 'Kore';

            // ============================================================
            // 4. الاتصال بـ Gemini API (Native Audio)
            // ============================================================
            // FIXED: Reverting to the specialized TTS model as confirmed by API capability check
            const modelName = "gemini-2.5-flash-preview-tts";
            let audioContent;

            try {
                // Determine voice configuration based on logic (ensure targetVoice is valid)
                // Using existing 'targetVoice' variable from above

                // Using v1beta as this model is listed there
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
                            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                        ]
                    })
                });

                if (!apiResponse.ok) {
                    // CRITICAL: Precise Error Logging
                    const errStatus = apiResponse.status;
                    const errText = await apiResponse.text();
                    console.error(`Gemini API Error details: Status=${errStatus}, Body=${errText}`);
                    throw new Error(`Gemini API Failed (${errStatus}): ${errText}`);
                }

                const resultData = await apiResponse.json();

                if (resultData.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
                    audioContent = resultData.candidates[0].content.parts[0].inlineData.data;
                } else {
                    console.error("Gemini returned no audio content. Full response:", JSON.stringify(resultData));
                    throw new Error("Gemini returned empty audio data.");
                }

            } catch (geminiError) {
                // DISABLE FALLBACK as per critical request
                logger.error("❌ Gemini High-Quality Generation Failed. Aborting to catch real error.", geminiError);
                throw geminiError; // Re-throw to be caught by main error handler and sent to client

                /* TEMPORARILY DISABLED FALLBACK
                logger.warn("⚠️ Switching to Google Cloud TTS Fallback (Standard)...", geminiError);
                const textToSpeech = require('@google-cloud/text-to-speech');
                const ttsClient = new textToSpeech.TextToSpeechClient();
                // ... fallback logic ...
                */
            }

            // ============================================================
            // 5. خصم الرصيد وحفظ السجل (Transaction)
            // ============================================================
            const transactionResult = await db.runTransaction(async (t) => {
                const freshUserDoc = await t.get(userRef);

                if (!freshUserDoc.exists) throw "USER_NOT_FOUND";

                const freshCredits = freshUserDoc.data().credits || 0;

                // التحقق النهائي من الرصيد (لضمان عدم حدوث تضارب في الطلبات المتزامنة)
                if (freshCredits < wordCount) throw "INSUFFICIENT_CREDITS";

                // خصم الرصيد
                t.update(userRef, {
                    credits: freshCredits - wordCount
                });

                // حفظ السجل
                const logRef = db.collection('logs').doc();
                t.set(logRef, {
                    userId: userId,
                    textSnippet: text.substring(0, 100), // حفظ أول 100 حرف فقط
                    wordCount: wordCount,
                    voice: voice,
                    status: 'success',
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                });

                return freshCredits - wordCount;
            });

            // إرسال الرد النهائي للعميل
            res.json({
                success: true,
                audioContent: audioContent,
                remainingCredits: transactionResult
            });

        } catch (error) {
            logger.error("Function Error:", error);

            // التعامل مع الأخطاء المعروفة
            if (error === "INSUFFICIENT_CREDITS" || error.message === "INSUFFICIENT_CREDITS") {
                return res.status(403).json({ error: "الرصيد نفد قبل إتمام العملية" });
            }
            if (error === "USER_NOT_FOUND") {
                return res.status(404).json({ error: "المستخدم غير موجود" });
            }

            res.status(500).json({ error: "حدث خطأ داخلي في الخادم: " + (error.message || "Unknown") });
        }
    });
});