import { Meta, StoryObj } from '@storybook/angular';
import { BadgeComponent } from './badge.component';
import { Tag } from '@models/tag.model';

const meta: Meta<BadgeComponent> = {
	title: 'Components/BadgeComponent',
	component: BadgeComponent,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		tag: {
			description: 'Tag object containing title, slug, shortDescription, and optional icon',
		},
		showIcon: {
			control: 'boolean',
			description: 'Whether to show the icon in the badge',
		},
	},
};

export default meta;
type Story = StoryObj<BadgeComponent>;

// Real tag data based on available badge icons
const bookTag: Tag = {
	title: 'Libros',
	slug: 'libros',
	shortDescription: 'Historias basadas en libros o temática literaria',
	description: [],
	icon: {
		name: 'book',
		provider: 'custom',
	},
};

const bookmarksTag: Tag = {
	title: 'Favoritos',
	slug: 'favoritos',
	shortDescription: 'Historias marcadas como favoritas por los usuarios',
	description: [],
	icon: {
		name: 'bookmarks',
		provider: 'custom',
	},
};

const trophyTag: Tag = {
	title: 'Premiado',
	slug: 'premiado',
	shortDescription: 'Historias ganadoras de premios o concursos',
	description: [],
	icon: {
		name: 'fa-trophy',
		provider: 'custom',
	},
};

const languageTag: Tag = {
	title: 'Internacional',
	slug: 'internacional',
	shortDescription: 'Historias con temática internacional o multiidioma',
	description: [],
	icon: {
		name: 'outline_language',
		provider: 'custom',
	},
};

const peopleTag: Tag = {
	title: 'Comunidad',
	slug: 'comunidad',
	shortDescription: 'Historias destacadas por la comunidad',
	description: [],
	icon: {
		name: 'people',
		provider: 'custom',
	},
};

const starsTag: Tag = {
	title: 'Destacado',
	slug: 'destacado',
	shortDescription: 'Historias con las mejores calificaciones',
	description: [],
	icon: {
		name: 'stars',
		provider: 'custom',
	},
};

const noIconTag: Tag = {
	title: 'Sin Ícono',
	slug: 'sin-icono',
	shortDescription: 'Etiqueta de ejemplo sin ícono asociado',
	description: [],
};

// Individual icon stories
export const BookBadge: Story = {
	args: {
		tag: bookTag,
		showIcon: true,
	},
};

export const BookmarksBadge: Story = {
	args: {
		tag: bookmarksTag,
		showIcon: true,
	},
};

export const TrophyBadge: Story = {
	args: {
		tag: trophyTag,
		showIcon: true,
	},
};

export const LanguageBadge: Story = {
	args: {
		tag: languageTag,
		showIcon: true,
	},
};

export const PeopleBadge: Story = {
	args: {
		tag: peopleTag,
		showIcon: true,
	},
};

export const StarsBadge: Story = {
	args: {
		tag: starsTag,
		showIcon: true,
	},
};

export const NoIconBadge: Story = {
	args: {
		tag: noIconTag,
		showIcon: false,
	},
};

export const NoIconButShowIconTrue: Story = {
	args: {
		tag: noIconTag,
		showIcon: true, // Even when showIcon is true, no icon will display because tag has no icon
	},
};

// Showcase stories
export const AllBadgesWithIcons: Story = {
	render: () => ({
		template: `
			<div class="flex flex-wrap gap-2">
				<cuentoneta-badge [tag]="bookTag" [showIcon]="true" />
				<cuentoneta-badge [tag]="bookmarksTag" [showIcon]="true" />
				<cuentoneta-badge [tag]="trophyTag" [showIcon]="true" />
				<cuentoneta-badge [tag]="languageTag" [showIcon]="true" />
				<cuentoneta-badge [tag]="peopleTag" [showIcon]="true" />
				<cuentoneta-badge [tag]="starsTag" [showIcon]="true" />
			</div>
		`,
		props: {
			bookTag,
			bookmarksTag,
			trophyTag,
			languageTag,
			peopleTag,
			starsTag,
		},
	}),
};

export const AllBadgesWithoutIcons: Story = {
	render: () => ({
		template: `
			<div class="flex flex-wrap gap-2">
				<cuentoneta-badge [tag]="bookTag" [showIcon]="false"   />
				<cuentoneta-badge [tag]="bookmarksTag" [showIcon]="false"   />
				<cuentoneta-badge [tag]="trophyTag" [showIcon]="false"   />
				<cuentoneta-badge [tag]="languageTag" [showIcon]="false"   />
				<cuentoneta-badge [tag]="peopleTag" [showIcon]="false"   />
				<cuentoneta-badge [tag]="starsTag" [showIcon]="false"   />
			</div>
		`,
		props: {
			bookTag,
			bookmarksTag,
			trophyTag,
			languageTag,
			peopleTag,
			starsTag,
		},
	}),
};

export const ComparisonShowcase: Story = {
	render: () => ({
		template: `
			<div class="space-y-4">
				<div>
					<h3 class="mb-2 text-lg font-semibold">Con Íconos</h3>
					<div class="flex flex-wrap gap-2">
						<cuentoneta-badge [tag]="bookTag" [showIcon]="true" />
						<cuentoneta-badge [tag]="bookmarksTag" [showIcon]="true" />
						<cuentoneta-badge [tag]="trophyTag" [showIcon]="true" />
						<cuentoneta-badge [tag]="languageTag" [showIcon]="true" />
						<cuentoneta-badge [tag]="peopleTag" [showIcon]="true" />
						<cuentoneta-badge [tag]="starsTag" [showIcon]="true" />
					</div>
				</div>
				
				<div>
					<h3 class="mb-2 text-lg font-semibold">Sin Íconos</h3>
					<div class="flex flex-wrap gap-2">
						<cuentoneta-badge [tag]="bookTag" [showIcon]="false" />
						<cuentoneta-badge [tag]="bookmarksTag" [showIcon]="false" />
						<cuentoneta-badge [tag]="trophyTag" [showIcon]="false" />
						<cuentoneta-badge [tag]="languageTag" [showIcon]="false" />
						<cuentoneta-badge [tag]="peopleTag" [showIcon]="false" />
						<cuentoneta-badge [tag]="starsTag" [showIcon]="false" />
					</div>
				</div>
				
				<div>
					<h3 class="mb-2 text-lg font-semibold">Sin Datos de Ícono</h3>
					<div class="flex flex-wrap gap-2">
						<cuentoneta-badge [tag]="noIconTag" [showIcon]="false" />
						<cuentoneta-badge [tag]="noIconTag" [showIcon]="true" />
					</div>
				</div>
			</div>
		`,
		props: {
			bookTag,
			bookmarksTag,
			trophyTag,
			languageTag,
			peopleTag,
			starsTag,
			noIconTag,
		},
	}),
};
