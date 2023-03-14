export default {
    name: 'author',
    title: 'Autor/a',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Nombre',
            type: 'string',
        },
        {
            name: 'image',
            title: 'Foto',
            type: 'image',
            options: {
                hotspot: true,
            },
        },
        {
            name: 'nationality',
            title: 'Nacionalidad',
            type: 'reference',
            to: { type: 'nationality' },
        },
        {
            name: 'bio',
            title: 'Biografía',
            type: 'text',
        },
        {
            name: 'fullBioUrl',
            title: 'Link Biografía Completa',
            type: 'url',
        },
    ],
    preview: {
        select: {
            title: 'name',
            media: 'image',
        },
    },
};
