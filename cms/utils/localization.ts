export interface Language {
	id: string;
	title: string;
	isDefault?: boolean;
}

export const defaultLanguage: Language = { id: 'es', title: 'Español', isDefault: true };
export const supportedLanguages: Language[] = [defaultLanguage, { id: 'en', title: 'English' }];
