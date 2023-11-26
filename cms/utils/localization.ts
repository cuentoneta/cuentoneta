export const supportedLanguages = [
    { id: 'es', title: 'Español', isDefault: true },
    { id: 'en', title: 'English' },
]

export const baseLanguage = supportedLanguages.find(l => l.isDefault)