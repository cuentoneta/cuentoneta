// Localization
import { supportedLanguages } from '../utils/localization';

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
      name: 'biography',
      title: 'Biografía',
      type: 'object',
      fieldsets: [
        {
          title: 'Traducciones',
          name: 'translations',
          options: { collapsible: true },
        },
      ],
      // Dynamically define one field per language
      fields: supportedLanguages.map((lang) => ({
        title: lang.title,
        name: lang.id,
        type: 'blockContent',
        fieldset: lang.isDefault ? null : 'translations',
      })),
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
