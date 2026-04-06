export const RISK_LEVELS = { HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW' }

export const CASE_STATUS = {
  PENDING: 'pending', REVIEWED: 'reviewed',
  ESCALATED: 'escalated', CLOSED: 'closed',
}

export const TABLES = {
  PATIENT_PROFILES: 'patient_profiles',
  TRIAGE_CASES: 'triage_cases',
};

export const RISK_CONFIG = {
  HIGH: {
    label: 'HIGH RISK', shortLabel: 'HIGH',
    color: '#DC2626', bg: '#FEF2F2', border: '#FECACA',
    sortOrder: 0, haptic: 'heavy', sound: true,
    nextSteps: 'Go to emergency or call 102 immediately.',
    hi: { label: 'उच्च जोखिम', nextSteps: 'तुरंत आपातकालीन स्थिति में जाएं या १०२ पर कॉल करें।' }
  },
  MEDIUM: {
    label: 'MODERATE RISK', shortLabel: 'MEDIUM',
    color: '#D97706', bg: '#FFFBEB', border: '#FDE68A',
    sortOrder: 1, haptic: 'medium', sound: false,
    nextSteps: 'See a doctor within 24–48 hours.',
    hi: { label: 'मध्यम जोखिम', nextSteps: '२४-४८ घंटों के भीतर डॉक्टर से मिलें।' }
  },
  LOW: {
    label: 'LOW RISK', shortLabel: 'LOW',
    color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0',
    sortOrder: 2, haptic: 'light', sound: false,
    nextSteps: 'Monitor symptoms at home. Rest and hydrate.',
    hi: { label: 'कम जोखिम', nextSteps: 'घर पर लक्षणों की निगरानी करें। आराम करें और हाइड्रेटेड रहें।' }
  },
}

export const TRANSLATIONS = {
  en: {
    greeting: 'Good',
    howFeeling: 'How are you feeling today?',
    startTriage: 'Start a triage',
    recentTriages: 'Recent triages',
    seeHistory: 'See history →',
    lastSession: 'Last triage session',
    readyToHelp: 'Ready to help',
    language: 'Language',
    signOut: 'Sign Out',
    editProfile: 'Edit Profile'
  },
  hi: {
    greeting: 'नमस्ते',
    howFeeling: 'आप आज कैसा महसूस कर रहे हैं?',
    startTriage: 'ट्राइएज शुरू करें',
    recentTriages: 'हाल के ट्राइएज',
    seeHistory: 'इतिहास देखें →',
    lastSession: 'पिछला सत्र',
    readyToHelp: 'मदद के लिए तैयार',
    language: 'भाषा',
    signOut: 'साइन आउट',
    editProfile: 'प्रोफ़ाइल बदलें'
  }
};

export const MESSAGE_ROLES = { USER: 'user', ASSISTANT: 'assistant' }
export const MESSAGE_TYPES = { TEXT: 'text', VOICE: 'voice', IMAGE: 'image', CHIPS: 'chips' }

export const TRIAGE_QUESTIONS_BANK = [
  'How long have you had these symptoms?',
  'On a scale of 1–10, how severe is your discomfort?',
  'Do you have a fever? If yes, what temperature?',
  'Have you taken any medication for this?',
  'Do you have any known allergies or medical conditions?',
  'Has anyone around you had similar symptoms recently?',
]

export const QUICK_REPLIES = {
  duration: ['1–2 days', '3–5 days', '1 week', 'More than a week'],
  severity: ['1–3 (mild)', '4–6 (moderate)', '7–10 (severe)'],
  yesNo: ['Yes', 'No', "I'm not sure"],
}
