import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'publication',
	title: 'Publicación de Cuento/Texto/Historia dentro de la storylist',
	type: 'object',
	preview: {
		select: {
			title: 'story.title',
			authorName: 'story.author.name',
			published: 'published',
			publishingDate: 'publishingDate',
		},
		prepare(selection) {
			const { title, authorName, published, publishingDate } = selection;
			return {
				title: `${authorName} - ${title}` || 'Sin título',
				subtitle: published ? `Publicado el ${new Date(publishingDate).toLocaleDateString()}` : 'No publicado',
			};
		},
	},
	fields: [
		defineField({
			name: 'story',
			title: 'Referencia a historia',
			type: 'reference',
			to: [{ type: 'story' }],
			options: {
				filter: ({ document }) => {
					return {
						params: {
							_id: document._id.startsWith('drafts.') ? document._id.split('drafts.')[1] : document._id,
						},
					};
				},
				disableNew: true,
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'published',
			title: '¿Publicado?',
			description:
				'Determina si la publicación fue o no liberada. Si el valor es false, la publicación no se mostrará como parte de la Storylist',
			type: 'boolean',
			validation: (Rule) => Rule.required(),
			initialValue: false,
		}),
		defineField({
			name: 'publishingOrder',
			title: 'Orden de publicación',
			description: 'Número ordinal de publicación dentro de la storylist para el cuento',
			type: 'number',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'publishingDate',
			title: 'Fecha de publicación',
			description: 'Fecha en la cual el cuento se publicó o publicará en la storylist',
			type: 'date',
			initialValue: new Date().toISOString().slice(0, 10),
			validation: (Rule) => Rule.required(),
		}),
	],
});
