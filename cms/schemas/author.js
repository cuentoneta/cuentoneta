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
      name: 'country',
      title: 'Nacionalidad',
      type: 'image',
    },
    {
      name: 'bio',
      title: 'Biografía',
      type: 'blockContent',
    },
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
  },
}
