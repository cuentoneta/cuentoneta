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
            name: 'displayDates',
            title: 'Mostrar fechas',
            type: 'boolean',
            initialValue: false,
        },
        {
            name: 'comingNextLabel',
            title: 'Etiqueta de "Próximo"',
            description:
                'Etiqueta que se mostrará en una publicación programada dentro de una storylist pero que aún no ha sido publicada.',
            type: 'string',
            validation: (Rule) => Rule.required(),
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
    initialValue: {
        comingNextLabel: 'Próximamente'
    }
};
