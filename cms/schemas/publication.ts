export default {
    name: 'publication',
    title: 'Publicación',
    type: 'document',
    preview: {
        select: {
            order: 'order',
            storylist: 'storylist.title',
            story: 'story.title',
            published: 'published',
            publishingDate: 'publishingDate',
        },
        prepare(selection) {
            const { order, storylist, story, published, publishingDate } = selection;



            return {
                title: `${story} | ${order}° en ${storylist}`,
                subtitle: `${
                    !published ? 'No publicado' : ('Publicado' + (publishingDate ? ' el ' + publishingDate : ''))
                }`,
            };
        },
    },
    fields: [
        {
            name: 'order',
            title: 'Orden en lista',
            description:
                'Campo que detalla el # de edición, el día de lanzamiento, etc. Se utiliza para determinar cómo ordenar una publicación dentro de una Storylist determinada. Este campo no podrá estar duplicado para historias dentro de una misma Storylist.',
            type: 'number',
            validation: (Rule) => Rule.required().min(1),
        },
        {
            name: 'story',
            title: 'Historia de la publicación',
            type: 'reference',
            to: [{ type: 'story' }],
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'storylist',
            title: 'Storylist',
            description: 'Storylist a la que pertenece la publicación.',
            type: 'reference',
            to: [{ type: 'storylist' }],
            validation: (Rule) => Rule.required(),
        },
        {
            name: 'publishingDate',
            title: 'Fecha de publicación',
            type: 'date',
        },
        {
            name: 'published',
            title: '¿Publicado?',
            description:
                'Determina si la publicación fue o no liberada. Si el valor es false, la publicación no se mostrará como parte de la Storylist',
            type: 'boolean',
            validation: (Rule) => Rule.required(),
            initialValue: false,
        },
    ],
};
