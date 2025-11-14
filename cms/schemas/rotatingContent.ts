import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
	name: 'rotatingContent',
	title: 'Contenido rotativo',
	type: 'document',
	fields: [
		defineField({
			name: 'name',
			title: 'Nombre',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'mostRead',
			title: 'Lo más leído',
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
	],
});
