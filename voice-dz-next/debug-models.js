
require('dotenv').config({ path: '.env.local' });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("No API KEY found in .env.local");
        return;
    }

    console.log("Checking models with key: " + key.substring(0, 5) + "...");

    // Check v1beta
    console.log("\n--- v1beta Models ---");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        if (data.models) {
            data.models.forEach(m => {
                if (m.name.includes("gemini")) {
                    console.log(`- ${m.name}`);
                    console.log(`  Output Modalities: ${JSON.stringify(m.supportedGenerationMethods)}`);
                }
            });
        }
    } catch (e) { console.error("v1beta error", e.message); }

    // Check v1alpha
    console.log("\n--- v1alpha Models ---");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1alpha/models?key=${key}`);
        const data = await response.json();
        if (data.models) {
            data.models.forEach(m => {
                if (m.name.includes("gemini")) {
                    console.log(`- ${m.name}`);
                    console.log(`  Output Modalities: ${JSON.stringify(m.supportedGenerationMethods)}`);
                }
            });
        }
    } catch (e) { console.error("v1alpha error", e.message); }
}

listModels();
