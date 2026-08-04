export interface InternalLink {
	path: string;
	label: string;
}

export interface UrlLink {
	url: string;
	label: string;
	ariaLabel: string;
	icon: string;
	alt: string;
}

export interface HeaderNavLink extends InternalLink {
	// El logo ya enlaza la home: esta entrada la repite, así que se muestra pero no se expone.
	readonly duplicatesBrandLink?: boolean;
}
