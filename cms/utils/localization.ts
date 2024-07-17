export interface Language {
	id: string;
	title: string;
	isDefault?: boolean;
}

export const supportedLanguages: Language[] = [
	{ id: 'es', title: 'Español', isDefault: true },
	{ id: 'en', title: 'English' },
];

export const baseLanguage: Language = supportedLanguages.find((l) => l.isDefault);
