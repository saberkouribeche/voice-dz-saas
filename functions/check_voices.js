const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();

async function listVoices() {
    const [result] = await client.listVoices({ languageCode: 'ar-XA' });
    const voices = result.voices;

    console.log('Available Arabic Voices:');
    voices.forEach(voice => {
        console.log(`Name: ${voice.name}, Gender: ${voice.ssmlGender}, Quality: ${voice.name.includes('Neural') ? 'Neural' : 'Standard'}`);
    });
}

listVoices();
