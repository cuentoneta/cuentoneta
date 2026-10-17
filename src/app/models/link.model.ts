import type { IconName } from '@ng-icons/core';

export interface InternalLink {
	path: string;
	label: string;
}

export interface UrlLink {
	url: string;
	label: string;
	ariaLabel: string;
	icon: IconName;
	alt: string;
}
