import { CodeBlockIcon } from '@sanity/icons';

export default {
  name: 'landingPage',
  title: 'Página de Inicio',
  type: 'document',
  icon: CodeBlockIcon,
  preview: {
    select: {
      config: 'config',
      active: 'active',
    },
    prepare(selection) {
      const { config, active } = selection;
      return {
        title: `${config}`,
        subtitle: active ? 'Activa' : 'Inactiva',
      };
    },
  },
  fields: [
    {
      name: 'config',
      title: 'Configuración',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'active',
      title: 'Activa',
      type: 'boolean',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'previews',
      title: 'Storylists con Vista Previa',
      type: 'array',
      of: [
        {
          name: 'storylist',
          title: 'Storylist',
          type: 'reference',
          to: [{ type: 'storylist' }],
        },
      ],
    },
    {
      name: 'cards',
      title: 'Storylists con Tarjetas',
      type: 'array',
      of: [
        {
          name: 'storylist',
          title: 'Storylist',
          type: 'reference',
          to: [{ type: 'storylist' }],
        },
      ],
    },
  ],
};
