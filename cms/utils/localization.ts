export interface Language {
	id: string;
	title: string;
	isDefault?: boolean;
}

export const defaultLanguage: Language = { id: 'es', title: 'Español', isDefault: true };

export const supportedLanguages: Language[] = [defaultLanguage, { id: 'en', title: 'English' }];

export const baseLanguage: Language = supportedLanguages.find((l) => l.isDefault) ?? defaultLanguage;

export const languageCodes = supportedLanguages.map((lang) => lang.id);
