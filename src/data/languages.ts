import { Language } from '../types';

export const LANGUAGES: Language[] = [
  // --- TOP GLOBAL / MOST SPOKEN ---
  { code: 'en', name: 'English', nativeName: 'English', region: 'Major', flag: '🇬🇧', speechCode: 'en-US' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'Major', flag: '🇪🇸', speechCode: 'es-ES' },
  { code: 'zh', name: 'Mandarin Chinese', nativeName: '中文 (普通话)', region: 'Major', flag: '🇨🇳', speechCode: 'zh-CN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'Major', flag: '🇮🇳', speechCode: 'hi-IN' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: 'Major', flag: '🇸🇦', speechCode: 'ar-SA' },
  { code: 'fr', name: 'French', nativeName: 'Français', region: 'Major', flag: '🇫🇷', speechCode: 'fr-FR' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'Major', flag: '🇧🇩', speechCode: 'bn-BD' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', region: 'Major', flag: '🇧🇷', speechCode: 'pt-BR' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', region: 'Major', flag: '🇷🇺', speechCode: 'ru-RU' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'Major', flag: '🇵🇰', speechCode: 'ur-PK' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', region: 'Major', flag: '🇮🇩', speechCode: 'id-ID' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'Major', flag: '🇩🇪', speechCode: 'de-DE' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'Major', flag: '🇯🇵', speechCode: 'ja-JP' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', region: 'Major', flag: '🇰🇪', speechCode: 'sw-KE' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', region: 'Major', flag: '🇰🇷', speechCode: 'ko-KR' },

  // --- EUROPE ---
  { code: 'it', name: 'Italian', nativeName: 'Italiano', region: 'Europe', flag: '🇮🇹', speechCode: 'it-IT' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', region: 'Europe', flag: '🇹🇷', speechCode: 'tr-TR' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', region: 'Europe', flag: '🇵🇱', speechCode: 'pl-PL' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', region: 'Europe', flag: '🇺🇦', speechCode: 'uk-UA' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', region: 'Europe', flag: '🇳🇱', speechCode: 'nl-NL' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', region: 'Europe', flag: '🇬🇷', speechCode: 'el-GR' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', region: 'Europe', flag: '🇨🇿', speechCode: 'cs-CZ' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', region: 'Europe', flag: '🇸🇪', speechCode: 'sv-SE' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', region: 'Europe', flag: '🇷🇴', speechCode: 'ro-RO' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', region: 'Europe', flag: '🇭🇺', speechCode: 'hu-HU' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', region: 'Europe', flag: '🇩🇰', speechCode: 'da-DK' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', region: 'Europe', flag: '🇫🇮', speechCode: 'fi-FI' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', region: 'Europe', flag: '🇳🇴', speechCode: 'no-NO' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', region: 'Europe', flag: '🇸🇰', speechCode: 'sk-SK' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', region: 'Europe', flag: '🇧🇬', speechCode: 'bg-BG' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', region: 'Europe', flag: '🇭🇷', speechCode: 'hr-HR' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', region: 'Europe', flag: '🇷🇸', speechCode: 'sr-RS' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', region: 'Europe', flag: '🇱🇹', speechCode: 'lt-LT' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', region: 'Europe', flag: '🇱🇻', speechCode: 'lv-LV' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', region: 'Europe', flag: '🇸🇮', speechCode: 'sl-SI' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', region: 'Europe', flag: '🇪🇪', speechCode: 'et-EE' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', region: 'Europe', flag: '🇮🇪', speechCode: 'ga-IE' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', region: 'Europe', flag: '🇮🇸', speechCode: 'is-IS' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', region: 'Europe', flag: '🇦🇱', speechCode: 'sq-AL' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', region: 'Europe', flag: '🇲🇰', speechCode: 'mk-MK' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski', region: 'Europe', flag: '🇧🇦', speechCode: 'bs-BA' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', region: 'Europe', flag: '🇲🇹', speechCode: 'mt-MT' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', region: 'Europe', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', speechCode: 'cy-GB' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskara', region: 'Europe', flag: '🇪🇸', speechCode: 'eu-ES' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', region: 'Europe', flag: '🇪🇸', speechCode: 'ca-ES' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego', region: 'Europe', flag: '🇪🇸', speechCode: 'gl-ES' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская', region: 'Europe', flag: '🇧🇾', speechCode: 'be-BY' },
  { code: 'lb', name: 'Luxembourgish', nativeName: 'Lëtzebuergesch', region: 'Europe', flag: '🇱🇺', speechCode: 'lb-LU' },

  // --- ASIA & PACIFIC ---
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', region: 'Asia & Pacific', flag: '🇻🇳', speechCode: 'vi-VN' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', region: 'Asia & Pacific', flag: '🇹🇭', speechCode: 'th-TH' },
  { code: 'fil', name: 'Filipino / Tagalog', nativeName: 'Wikang Filipino', region: 'Asia & Pacific', flag: '🇵🇭', speechCode: 'fil-PH' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', region: 'Asia & Pacific', flag: '🇲🇾', speechCode: 'ms-MY' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Asia & Pacific', flag: '🇮🇳', speechCode: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Asia & Pacific', flag: '🇮🇳', speechCode: 'te-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'Asia & Pacific', flag: '🇮🇳', speechCode: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Asia & Pacific', flag: '🇮🇳', speechCode: 'gu-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Asia & Pacific', flag: '🇮🇳', speechCode: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', region: 'Asia & Pacific', flag: '🇮🇳', speechCode: 'ml-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Asia & Pacific', flag: '🇮🇳', speechCode: 'pa-IN' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'Asia & Pacific', flag: '🇮🇳', speechCode: 'or-IN' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', region: 'Asia & Pacific', flag: '🇳🇵', speechCode: 'ne-NP' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', region: 'Asia & Pacific', flag: '🇱🇰', speechCode: 'si-LK' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာစာ', region: 'Asia & Pacific', flag: '🇲🇲', speechCode: 'my-MM' },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', region: 'Asia & Pacific', flag: '🇰🇭', speechCode: 'km-KH' },
  { code: 'lo', name: 'Lao', nativeName: 'ພາສາລາວ', region: 'Asia & Pacific', flag: '🇱🇦', speechCode: 'lo-LA' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол хэл', region: 'Asia & Pacific', flag: '🇲🇳', speechCode: 'mn-MN' },
  { code: 'zh-TW', name: 'Traditional Chinese', nativeName: '繁體中文', region: 'Asia & Pacific', flag: '🇹🇼', speechCode: 'zh-TW' },
  { code: 'yue', name: 'Cantonese', nativeName: '粵語', region: 'Asia & Pacific', flag: '🇭🇰', speechCode: 'zh-HK' },
  { code: 'bo', name: 'Tibetan', nativeName: 'བོད་སྐད', region: 'Asia & Pacific', flag: '🇨🇳', speechCode: 'bo-CN' },
  { code: 'jv', name: 'Javanese', nativeName: 'Basa Jawa', region: 'Asia & Pacific', flag: '🇮🇩', speechCode: 'jv-ID' },
  { code: 'su', name: 'Sundanese', nativeName: 'Basa Sunda', region: 'Asia & Pacific', flag: '🇮🇩', speechCode: 'su-ID' },
  { code: 'sm', name: 'Samoan', nativeName: 'Gagana Samoa', region: 'Asia & Pacific', flag: '🇼🇸', speechCode: 'sm-WS' },
  { code: 'mi', name: 'Maori', nativeName: 'Te Reo Māori', region: 'Asia & Pacific', flag: '🇳🇿', speechCode: 'mi-NZ' },

  // --- MIDDLE EAST & CENTRAL ASIA ---
  { code: 'fa', name: 'Persian (Farsi)', nativeName: 'فارسی', region: 'Middle East & Central Asia', flag: '🇮🇷', speechCode: 'fa-IR' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', region: 'Middle East & Central Asia', flag: '🇮🇱', speechCode: 'he-IL' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақ тілі', region: 'Middle East & Central Asia', flag: '🇰🇿', speechCode: 'kk-KZ' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbekcha', region: 'Middle East & Central Asia', flag: '🇺🇿', speechCode: 'uz-UZ' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan dili', region: 'Middle East & Central Asia', flag: '🇦🇿', speechCode: 'az-AZ' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', region: 'Middle East & Central Asia', flag: '🇦🇲', speechCode: 'hy-AM' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', region: 'Middle East & Central Asia', flag: '🇬🇪', speechCode: 'ka-GE' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', region: 'Middle East & Central Asia', flag: '🇦🇫', speechCode: 'ps-AF' },
  { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî / کوردی', region: 'Middle East & Central Asia', flag: '🇮🇶', speechCode: 'ku-IQ' },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ', region: 'Middle East & Central Asia', flag: '🇹🇯', speechCode: 'tg-TJ' },
  { code: 'tk', name: 'Turkmen', nativeName: 'Türkmençe', region: 'Middle East & Central Asia', flag: '🇹🇲', speechCode: 'tk-TM' },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча', region: 'Middle East & Central Asia', flag: '🇰🇬', speechCode: 'ky-KG' },
  { code: 'ug', name: 'Uyghur', nativeName: 'ئۇيغۇرچە', region: 'Middle East & Central Asia', flag: '🇨🇳', speechCode: 'ug-CN' },

  // --- AFRICA ---
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', region: 'Africa', flag: '🇪🇹', speechCode: 'am-ET' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Èdè Yorùbá', region: 'Africa', flag: '🇳🇬', speechCode: 'yo-NG' },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo', region: 'Africa', flag: '🇳🇬', speechCode: 'ig-NG' },
  { code: 'ha', name: 'Hausa', nativeName: 'Harshen Hausa', region: 'Africa', flag: '🇳🇬', speechCode: 'ha-NG' },
  { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo', region: 'Africa', flag: '🇪🇹', speechCode: 'om-ET' },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', region: 'Africa', flag: '🇪🇷', speechCode: 'ti-ER' },
  { code: 'so', name: 'Somali', nativeName: 'Af-Soomaali', region: 'Africa', flag: '🇸🇴', speechCode: 'so-SO' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', region: 'Africa', flag: '🇿🇦', speechCode: 'zu-ZA' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', region: 'Africa', flag: '🇿🇦', speechCode: 'xh-ZA' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', region: 'Africa', flag: '🇿🇦', speechCode: 'af-ZA' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', region: 'Africa', flag: '🇷🇼', speechCode: 'rw-RW' },
  { code: 'rn', name: 'Kirundi', nativeName: 'Ikirundi', region: 'Africa', flag: '🇧🇮', speechCode: 'rn-BI' },
  { code: 'st', name: 'Sesotho', nativeName: 'Sesotho', region: 'Africa', flag: '🇱🇸', speechCode: 'st-ZA' },
  { code: 'sn', name: 'Shona', nativeName: 'chiShona', region: 'Africa', flag: '🇿🇼', speechCode: 'sn-ZW' },
  { code: 'ny', name: 'Chichewa', nativeName: 'Chichewa', region: 'Africa', flag: '🇲🇼', speechCode: 'ny-MW' },
  { code: 'mg', name: 'Malagasy', nativeName: 'Malagasy', region: 'Africa', flag: '🇲🇬', speechCode: 'mg-MG' },
  { code: 'wo', name: 'Wolof', nativeName: 'Wolof', region: 'Africa', flag: '🇸🇳', speechCode: 'wo-SN' },
  { code: 'ln', name: 'Lingala', nativeName: 'Lingála', region: 'Africa', flag: '🇨🇩', speechCode: 'ln-CD' },
  { code: 'bm', name: 'Bambara', nativeName: 'Bamanankan', region: 'Africa', flag: '🇲🇱', speechCode: 'bm-ML' },
  { code: 'lg', name: 'Luganda', nativeName: 'Oluganda', region: 'Africa', flag: '🇺🇬', speechCode: 'lg-UG' },
  { code: 'ee', name: 'Ewe', nativeName: 'Eʋegbe', region: 'Africa', flag: '🇬🇭', speechCode: 'ee-GH' },
  { code: 'tw', name: 'Twi / Akan', nativeName: 'Twi', region: 'Africa', flag: '🇬🇭', speechCode: 'ak-GH' },

  // --- AMERICAS & INDIGENOUS ---
  { code: 'qu', name: 'Quechua', nativeName: 'Runasimi', region: 'Americas', flag: '🇵🇪', speechCode: 'qu-PE' },
  { code: 'gn', name: 'Guarani', nativeName: "Avañe'ẽ", region: 'Americas', flag: '🇵🇾', speechCode: 'gn-PY' },
  { code: 'ay', name: 'Aymara', nativeName: 'Aymar aru', region: 'Americas', flag: '🇧🇴', speechCode: 'ay-BO' },
  { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl Ayisyen', region: 'Americas', flag: '🇭🇹', speechCode: 'ht-HT' },
  { code: 'nah', name: 'Nahuatl', nativeName: 'Nāhuatl', region: 'Americas', flag: '🇲🇽', speechCode: 'es-MX' },

  // --- OTHER & CLASSICAL ---
  { code: 'eo', name: 'Esperanto', nativeName: 'Esperanto', region: 'Other', flag: '🌐', speechCode: 'eo' },
  { code: 'la', name: 'Latin', nativeName: 'Latīna', region: 'Other', flag: '🏛️', speechCode: 'la' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', region: 'Other', flag: '🕉️', speechCode: 'sa-IN' },
  { code: 'yi', name: 'Yiddish', nativeName: 'ייִדיש', region: 'Other', flag: '✡️', speechCode: 'yi-001' }
];

// Featured popular languages for quick selection chips
const featuredCodes = ['am', 'en', 'es', 'fr', 'zh', 'ar', 'hi', 'de', 'ja', 'sw'];
export const POPULAR_LANGUAGES: Language[] = featuredCodes
  .map(code => LANGUAGES.find(l => l.code === code))
  .filter((l): l is Language => Boolean(l));

export const AMHARIC_LANGUAGE: Language = LANGUAGES.find(l => l.code === 'am') || {
  code: 'am',
  name: 'Amharic',
  nativeName: 'አማርኛ',
  region: 'Africa',
  flag: '🇪🇹',
  speechCode: 'am-ET',
};

export const DEFAULT_TARGET_LANGUAGE = 'en';

