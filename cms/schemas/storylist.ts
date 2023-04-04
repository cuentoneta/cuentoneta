export default {
    name: 'storylist',
    title: 'Storylists',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Título',
            type: 'string',
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
            name: 'description',
            title: 'Descripción',
            type: 'text',
        },
        {
            name: 'language',
            title: 'Idioma',
            type: 'string',
        },
        {
            name: 'editionPrefix',
            title: 'Prefijo de edición',
            description:
                'Prefijo usado para identificar qué representa cada historia en una Storylist (día, edición, historia, etc.)',
            type: 'string',
            default: 'Edición',
        },
        {
            name: 'image',
            title: 'Imagen',
            type: 'image',
            options: {
                hotspot: true,
            },
        },
    ],
};
