export default {
    name: 'story',
    title: 'Cuento',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Título',
            type: 'string',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'day',
            title: 'Día',
            type: 'number',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'author',
            title: 'Autor/a',
            type: 'reference',
            to: { type: 'author' },
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'originalLink',
            title: 'Link Original',
            type: 'string',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'approximateReadingTime',
            title: 'Tiempo de lectura aproximado',
            type: 'computedNumber',
            readOnly: true,
            options: {
                buttonText: 'Recalcular',
                documentQuerySelection: `
                    "numberOfParagraphs": count(*[references(^._id)]{ body })
                `,
            },
        },
        {
            name: 'forewords',
            title: 'Prólogo(s)',
            type: 'array',
            of: [
                {
                    name: 'foreword',
                    title: 'Prólogo',
                    type: 'object',
                    fields: [
                        {
                            name: 'fwText',
                            title: 'Texto del prólogo',
                            type: 'string',
                        },
                        {
                            name: 'fwAuthor',
                            title: 'Referencia del prólogo',
                            description: 'Referencia del origen del prólogo',
                            type: 'string',
                        },
                    ],
                },
            ],
        },
        {
            name: 'categories',
            title: 'Categories',
            type: 'array',
            of: [{ type: 'reference', to: { type: 'category' } }],
        },
        {
            name: 'publishedAt',
            title: 'Fecha de liberacion',
            type: 'date',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'body',
            title: 'Cuerpo del cuento',
            type: 'blockContent',
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'review',
            title: 'Reseña',
            type: 'blockContent',
            validation: (Rule) => Rule.required(),
        },
    ],

    preview: {
        select: {
            title: 'title',
            edition: 'edition',
            author: 'author.name',
            media: 'mainImage',
            day: 'day',
        },
        prepare(selection) {
            const { title, author, edition, day } = selection;
            return {
                title: `${day} - ${title}`,
                subtitle: `por ${author} | ${edition}`,
            };
        },
    },
};
