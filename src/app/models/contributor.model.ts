export type ContributorAreaType = 'staff' | 'programming' | 'content-generation' | 'content-pick';

export const CONTRIBUTOR_AREA_LABELS: Record<ContributorAreaType, string> = {
	staff: 'Staff',
	programming: 'Programación',
	'content-generation': 'Generación de contenido',
	'content-pick': 'Selección, transcripción y curación de contenido',
};

export interface ContributorArea {
	slug: ContributorAreaType;
	name: string;
}

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

export const SORTED_AREAS: { area: ContributorArea; contributors: Contributor[] }[] = [
	{
		area: {
			slug: 'staff',
			name: CONTRIBUTOR_AREA_LABELS['staff'],
		},
		contributors: [],
	},
	{
		area: {
			slug: 'programming',
			name: CONTRIBUTOR_AREA_LABELS['programming'],
		},
		contributors: [],
	},
	{
		area: {
			slug: 'content-generation',
			name: CONTRIBUTOR_AREA_LABELS['content-generation'],
		},
		contributors: [],
	},
	{
		area: {
			slug: 'content-pick',
			name: CONTRIBUTOR_AREA_LABELS['content-pick'],
		},
		contributors: [],
	},
];
