import { defineArrayMember, defineField, defineType } from 'sanity';
import { SyncIcon } from '@sanity/icons/Sync';

export default defineType({
	name: 'rotatingContent',
	title: 'Contenido rotativo',
	type: 'document',
	icon: SyncIcon,
	options: {
		singleton: true, // Identify this document as a singleton
	},
	fields: [
		defineField({
			name: 'name',
			title: 'Nombre',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'mostRead',
			title: 'Lo más leído (en baja)',
			type: 'array',
			of: [
				defineArrayMember({
					name: 'story',
					title: 'Historia',
					type: 'reference',
					to: [{ type: 'story' }],
				}),
			],
		}),
		// Convive con el de arriba por el mismo motivo que los de la página de inicio: el Studio y la
		// aplicación no despliegan a la vez.
		defineField({
			name: 'mostReadLiteraryWorks',
			title: 'Lo más leído (obras)',
			type: 'array',
			of: [
				defineArrayMember({
					name: 'literaryWork',
					title: 'Obra literaria',
					type: 'reference',
					to: [{ type: 'literaryWork' }],
				}),
			],
		}),
	],
});
