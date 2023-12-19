import { CodeBlockIcon } from '@sanity/icons';

export default {
  name: 'landingPage',
  title: 'Página de Inicio',
  type: 'document',
  icon: CodeBlockIcon,
  fields: [
    {
      name: 'config',
      title: 'Configuración',
      type: 'string',
    },
    {
      name: 'active',
      title: 'Activa',
      type: 'boolean',
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
