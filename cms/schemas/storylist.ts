const gridItemFields = [
  {
    name: 'order',
    title: 'Orden',
    type: 'number',
    validation: (Rule) => Rule.required(),
  },
  {
    name: 'startCol',
    title: 'Columna inicial en CSS Grid',
    type: 'string',
  },
  {
    name: 'endCol',
    title: 'Columna final en CSS Grid',
    type: 'string',
  },
  {
    name: 'startRow',
    title: 'Fila inicial en CSS Grid',
    type: 'string',
  },
  {
    name: 'endRow',
    title: 'Fila final en CSS Grid',
    type: 'string',
  },
];

const gridConfigfields = [
  {
    name: 'gridTemplateColumns',
    title: 'Template de columnas en CSS Grid (grid-template-columns)',
    type: 'string',
    description: 'Ejemplo: "repeat(3, 1fr)", "repeat(12, 1fr), etc.',
    initialValue: 'repeat(3, 1fr)',
  },
  {
    name: 'titlePlacement',
    title: 'Posición del título',
    type: 'object',
    fields: [...gridItemFields],
  },
  {
    name: 'cardsPlacement',
    description:
      'Posiciones de las tarjetas y las imágenes alusivas de la storylist, con su orden de renderizado y extensión en columnas y filas dentro del layout de CSS Grid',
    type: 'array',
    of: [
      {
        name: 'deckPreviewConfigItem',
        title: 'Configuración de preview de Storylist',
        type: 'object',
        preview: {
          select: {
            order: 'order',
            storyTitle: 'publication.story.title',
            image: 'image',
            imageSlug: 'imageSlug.current',
            startCol: 'startCol',
            endCol: 'endCol',
          },
          prepare(selection) {
            const { order, storyTitle, image, imageSlug, startCol, endCol } =
              selection;

            // Preview para stories en grid
            const title = `${image ? imageSlug : storyTitle}`;

            // Preview para imágenes en grid
            return {
              title: `${order} | ${title} | [${startCol}, ${endCol}]`,
              media: image ?? undefined,
            };
          },
        },
        fields: [
          {
            name: 'publication',
            title: 'Elemento',
            type: 'reference',
            to: [{ type: 'publication' }],
            options: {
              filter: ({ document }) => {
                return {
                  filter: 'storylist._ref == $_id',
                  params: {
                    _id: document._id.startsWith('drafts.')
                      ? document._id.split('drafts.')[1]
                      : document._id,
                  },
                };
              },
              disableNew: true,
            },
          },
          {
            name: 'image',
            title: 'Imagen de grid',
            type: 'image',
            options: {
              hotspot: true,
            },
          },
          {
            name: 'imageSlug',
            title: 'Slug',
            type: 'slug',
            options: {
              source: 'title',
              maxLength: 96,
            },
          },
          {
            name: 'publishingOrder',
            title: 'Orden de publicación',
            description: 'Número ordinal de publicación dentro de la storylist para el cuento',
            type: 'number',
          },
          {
            name: 'publishingDate',
            title: 'Fecha de publicación',
            description: 'Fecha en la cual el cuento se publicó o publicará en la storylist',
            type: 'date',
          },
          ...gridItemFields,
        ],
        initialValue: {
          startCol: 'auto',
          endCol: 'span 4',
        },
      },
    ],
  },
];

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
      validation: (Rule) => Rule.required(),
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
      },
    },
    {
      name: 'gridConfig',
      title:
        'Configuración de vista completa de Storylist en layout de CSS Grid',
      type: 'object',
      fields: [...gridConfigfields],
    },
    {
      name: 'previewGridConfig',
      title: 'Configuración de vista previa de Storylist en layout de CSS Grid',
      type: 'object',
      fields: [
        ...gridConfigfields,
        {
          name: 'ordering',
          title: 'Orden de publicaciones',
          description: 'Orden de publicaciones en vista previa de Storylist',
          type: 'string',
          options: {
            list: [
              { title: 'Ascendente', value: 'asc' },
              { title: 'Descendente', value: 'desc' },
            ],
          },
        },
        {
          name: 'landingPageOrder',
          title: 'Orden en landing page',
          type: 'number',
        },
      ],
    },
  ],
  initialValue: {
    comingNextLabel: 'Próximamente',
    language: 'Español',
  },
};
