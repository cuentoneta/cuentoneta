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
      validation: (Rule) => Rule.required()
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
      name: 'featuredImage',
      title: 'Imagen destacada',
      type: 'image',
      options: {
        hotspot: true,
      }
    },
    {
      name: 'images',
      title: 'Imágenes',
      description:
        'Lista de imágenes que se mostrarán en el grid de la storylist.',
      type: 'array',
      of: [
        {
          name: 'imageObject',
          title: 'Imagen',
          type: 'object',
          fields: [
            {
              name: 'source',
              title: 'Imagen de grid',
              type: 'image',
              options: {
                hotspot: true,
              },
            },
            {
              name: 'slug',
              title: 'Slug',
              type: 'slug',
              options: {
                source: 'title',
                maxLength: 96,
              },
            },
          ],
          preview: {
            select: {
              slug: 'slug',
              source: 'source',
            },
            prepare({ slug, source }) {
              return { title: slug.current, media: source };
            },
          },
        },
      ],
    },
  ],
  initialValue: {
    comingNextLabel: 'Próximamente',
    language: 'Español',
  },
};
