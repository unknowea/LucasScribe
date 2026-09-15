import { TranscriptionRecord } from '../types';

export const SAMPLE_RECORDS: TranscriptionRecord[] = [
  {
    id: 'sample-amharic-audio-text',
    createdAt: Date.now() - 300000,
    audioDurationSeconds: 16,
    fileName: 'Amharic_Voice_Recording.wav',
    detectedLanguage: 'Amharic',
    detectedLanguageCode: 'am',
    detectedConfidence: 0.99,
    originalTranscript:
      'ሰላም ጤና ይስጥልኝ! እንኳን ወደ አዲሱ ዓለም አቀፍ የድምፅ ወደ ጽሁፍ መቀየሪያ በደህና መጡ። ይህ መተግበሪያ ማንኛውንም የአማርኛ ንግግር በቀጥታ ወደ አማርኛ ጽሁፍ በከፍተኛ ትክክለኛነት ይቀይራል፤ እንዲሁም ወደ ማንኛውም የዓለም ቋንቋ በቅጽበት ይተረጉማል።',
    targetLanguage: 'Amharic',
    translatedText:
      'ሰላም ጤና ይስጥልኝ! እንኳን ወደ አዲሱ ዓለም አቀፍ የድምፅ ወደ ጽሁፍ መቀየሪያ በደህና መጡ። ይህ መተግበሪያ ማንኛውንም የአማርኛ ንግግር በቀጥታ ወደ አማርኛ ጽሁፍ በከፍተኛ ትክክለኛነት ይቀይራል፤ እንዲሁም ወደ ማንኛውም የዓለም ቋንቋ በቅጽበት ይተረጉማል።',
    summary:
      'የአማርኛ ድምፅን በቀጥታ ወደ አማርኛ ፊደል ጽሁፍ የሚቀይር እና በዓለም ዙሪያ ያሉ ቋንቋዎችን በቅጽበት የሚተረጉም ሁለንተናዊ የድምፅ ቴክኖሎጂ።',
    segments: [
      {
        id: 1,
        start: '00:00',
        end: '00:04',
        original: 'ሰላም ጤና ይስጥልኝ! እንኳን ወደ አዲሱ ዓለም አቀፍ የድምፅ ወደ ጽሁፍ መቀየሪያ በደህና መጡ።',
        translated: 'ሰላም ጤና ይስጥልኝ! እንኳን ወደ አዲሱ ዓለም አቀፍ የድምፅ ወደ ጽሁፍ መቀየሪያ በደህና መጡ።',
      },
      {
        id: 2,
        start: '00:05',
        end: '00:10',
        original: 'ይህ መተግበሪያ ማንኛውንም የአማርኛ ንግግር በቀጥታ ወደ አማርኛ ጽሁፍ በከፍተኛ ትክክለኛነት ይቀይራል...',
        translated: 'ይህ መተግበሪያ ማንኛውንም የአማርኛ ንግግር በቀጥታ ወደ አማርኛ ጽሁፍ በከፍተኛ ትክክለኛነት ይቀይራል...',
      },
      {
        id: 3,
        start: '00:11',
        end: '00:16',
        original: '...እንዲሁም ወደ ማንኛውም የዓለም ቋንቋ በቅጽበት ይተረጉማል።',
        translated: '...እንዲሁም ወደ ማንኛውም የዓለም ቋንቋ በቅጽበት ይተረጉማል።',
      },
    ],
  },
  {
    id: 'sample-spanish-greeting',
    createdAt: Date.now() - 600000,
    audioDurationSeconds: 12,
    fileName: 'Global_Keynote_Announcement.wav',
    detectedLanguage: 'Spanish',
    detectedLanguageCode: 'es',
    detectedConfidence: 0.99,
    originalTranscript:
      '¡Hola a todos! Bienvenidos a nuestra conferencia internacional. Es un honor anunciar que nuestro sistema de transcripción en tiempo real ahora procesa cualquier idioma del mundo con traducción instantánea.',
    targetLanguage: 'English',
    translatedText:
      'Hello everyone! Welcome to our international conference. It is an honor to announce that our real-time transcription system now processes any language in the world with instant translation.',
    summary:
      'An opening announcement presenting universal real-time multilingual transcription covering every language worldwide.',
    segments: [
      {
        id: 1,
        start: '00:00',
        end: '00:03',
        original: '¡Hola a todos! Bienvenidos a nuestra conferencia internacional.',
        translated: 'Hello everyone! Welcome to our international conference.',
      },
      {
        id: 2,
        start: '00:04',
        end: '00:08',
        original: 'Es un honor anunciar que nuestro sistema de transcripción en tiempo real ahora procesa cualquier idioma del mundo...',
        translated: 'It is an honor to announce that our real-time transcription system now processes any language in the world...',
      },
      {
        id: 3,
        start: '00:09',
        end: '00:12',
        original: '...con traducción instantánea y subtítulos automáticos para cada grabación.',
        translated: '...with instant translation and automatic subtitles for every recording.',
      },
    ],
  },
  {
    id: 'sample-japanese-travel',
    createdAt: Date.now() - 1200000,
    audioDurationSeconds: 15,
    fileName: 'Tokyo_Travel_Guide_Audio.mp3',
    detectedLanguage: 'Japanese',
    detectedLanguageCode: 'ja',
    detectedConfidence: 0.98,
    originalTranscript:
      '皆さん、こんにちは！東京へようこそ。今日は伝統的な浅草寺を訪れ、その後最新のテクノロジーが集まる秋葉原に向かいます。素晴らしい一日を過ごしましょう。',
    targetLanguage: 'English',
    translatedText:
      "Hello everyone! Welcome to Tokyo. Today, we will visit the traditional Senso-ji Temple and then head to Akihabara, where the latest technology gathers. Let's have a wonderful day.",
    summary:
      'A warm travel introduction to Tokyo highlighting visits to traditional Senso-ji Temple and the modern Akihabara tech district.',
    segments: [
      {
        id: 1,
        start: '00:00',
        end: '00:04',
        original: '皆さん、こんにちは！東京へようこそ。',
        translated: 'Hello everyone! Welcome to Tokyo.',
      },
      {
        id: 2,
        start: '00:05',
        end: '00:11',
        original: '今日は伝統的な浅草寺を訪れ、その後最新のテクノロジーが集まる秋葉原に向かいます。',
        translated: 'Today, we will visit the traditional Senso-ji Temple and then head to Akihabara, where the latest technology gathers.',
      },
      {
        id: 3,
        start: '00:12',
        end: '00:15',
        original: '素晴らしい一日を過ごしましょう。',
        translated: "Let's have a wonderful day.",
      },
    ],
  },
  {
    id: 'sample-french-innovation',
    createdAt: Date.now() - 1800000,
    audioDurationSeconds: 13,
    fileName: 'Innovation_Paris_Podcast.m4a',
    detectedLanguage: 'French',
    detectedLanguageCode: 'fr',
    detectedConfidence: 0.97,
    originalTranscript:
      "Bonjour à tous et bienvenue à Paris. Aujourd'hui, nous explorons comment l'intelligence artificielle brise toutes les barrières linguistiques et permet à chacun de se comprendre sans frontières.",
    targetLanguage: 'English',
    translatedText:
      'Hello everyone and welcome to Paris. Today, we explore how artificial intelligence is breaking down all language barriers and enabling everyone to understand each other without borders.',
    summary:
      'A discussion on how AI speech transcription and translation eliminates global linguistic barriers.',
    segments: [
      {
        id: 1,
        start: '00:00',
        end: '00:04',
        original: 'Bonjour à tous et bienvenue à Paris.',
        translated: 'Hello everyone and welcome to Paris.',
      },
      {
        id: 2,
        start: '00:05',
        end: '00:09',
        original: "Aujourd'hui, nous explorons comment l'intelligence artificielle brise toutes les barrières linguistiques...",
        translated: 'Today, we explore how artificial intelligence is breaking down all language barriers...',
      },
      {
        id: 3,
        start: '00:10',
        end: '00:13',
        original: '...et permet à chacun de se comprendre sans frontières.',
        translated: '...and enabling everyone to understand each other without borders.',
      },
    ],
  },
];
