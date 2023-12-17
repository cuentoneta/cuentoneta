import { TagIcon } from '@sanity/icons';
import { preview } from 'sanity-plugin-icon-picker';

export default {
  name: 'tag',
  title: 'Etiquetas',
  type: 'document',
  icon: TagIcon,
  preview: {
    select: {
      title: 'title',
      description: 'description',
      provider: 'icon.provider',
      name: 'icon.name',
    },
    prepare(selection) {
      return {
        title: selection.title,
        subtitle: selection.description,
        media: preview(selection),
      };
    },
  },
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
      type: 'string',
    },
    {
      name: 'icon',
      title: 'Icono',
      type: 'iconPicker',
      options: {
        storeSvg: true
      }
    },
  ],
};
