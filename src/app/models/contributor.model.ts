export type ContributorArea = 'staff' | 'programming' | 'content-generation' | 'content-pick';

export interface ContributorLink {
	handle?: string;
	url?: string;
}

export interface Contributor {
	slug: string;
	name: string;
	area: ContributorArea;
	link: ContributorLink;
	notes?: string;
}
