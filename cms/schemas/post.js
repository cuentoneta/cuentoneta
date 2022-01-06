import { type } from "os"
import { title } from "process"

export default {
  name: 'story',
  title: 'Artículo',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
    },
    {
      name: 'day',
      title: 'Día',
      type: 'number',
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
    {
      name: 'author',
      title: 'Autor/a',
      type: 'reference',
      to: {type: 'author'},
    },
    {
      name: 'originalLink',
      title: 'Link Original',
      type: 'string',
    },
    {
      name: 'mainImage',
      title: 'Imagen de portada',
      type: 'image',
      options: {
        hotspot: true,
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
      of: [{type: 'reference', to: {type: 'category'}}],
    },
    {
      name: 'publishedAt',
      title: 'Fecha de liberacion',
      type: 'date',
    },
    {
      name: 'body',
      title: 'Cuerpo del cuento',
      type: 'blockContent',
    },
    {
      name: 'review',
      title: 'Reseña',
      type: 'blockContent',
    }
  ],

  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
    },
    prepare(selection) {
      const {author} = selection
      return Object.assign({}, selection, {
        subtitle: author && `by ${author}`,
      })
    },
  },
}
