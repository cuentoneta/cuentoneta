import { TagIcon } from '@sanity/icons';

export default {
  name: 'tag',
  title: 'Etiquetas',
  type: 'document',
  icon: TagIcon,
  fields: [
    {
      name: 'name',
      title: 'Nombre',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
    },
    {
      name: 'icon',
      title: 'Icono',
      type: 'image',
    },
  ],
};
