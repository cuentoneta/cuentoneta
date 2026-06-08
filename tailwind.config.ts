import { createGlobPatternsForDependencies } from '@nx/angular/tailwind';
import { join } from 'path';
import { Config } from 'tailwindcss';
import { extendedColors, spacing, borderRadius, blur, fontSize } from './theme.config';
import { VIEWPORT_WIDTHS_PX } from './src/app/utils/screen.utils';
import { HEADER_HEIGHT_STRING_PX } from './src/app/utils/spacing.utils';

/*
	Configuración de Tailwind CSS v4 cargada mediante la directiva `@config` desde `src/tailwind.css`.

	Se conserva el archivo de configuración en formato JS/TS (en lugar de migrar a `@theme` en CSS) para
	mantener `theme.config.ts` como fuente única de verdad del Design System, ya que sus tokens también son
	consumidos por pruebas unitarias (ver `src/app/theme-config.spec.ts`) y utilidades de la aplicación.

	El `safelist` de Tailwind v3 se reemplazó por la directiva `@source inline(...)` en `src/styles.css`,
	dado que v4 ya no admite la opción `safelist` en la configuración.
*/
export default {
	content: [join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'), ...createGlobPatternsForDependencies(__dirname)],
	theme: {
		colors: extendedColors,
		content: {
			blank: '""',
		},
		screens: VIEWPORT_WIDTHS_PX,
		borderWidth: {
			0: '0',
			1: '1px',
			2: '2px',
			3: '3px',
			4: '4px',
		},
		// Design System V3 - Reemplaza valores por defecto
		borderRadius: borderRadius,
		blur: blur,
		extend: {
			lineClamp: {
				4: '4',
				5: '5',
				6: '6',
				7: '7',
				8: '8',
				9: '9',
				10: '10',
			},
			boxShadow: {
				lg: '0px 0px 8px rgba(63, 63, 70, 0.08)',
				'lg-hover': '0px 12px 16px rgba(63, 63, 70, 0.12)',
			},
			fontFamily: {
				inter: ['Inter', 'sans-serif'],
				'source-serif': ['Source Serif Pro', 'sans-serif'],
			},
			// Design System V3 - Spacing
			spacing: {
				...spacing,
				'1/2': '50%',
				'5/4': '120%',
				'header-height': HEADER_HEIGHT_STRING_PX,
			},
			// Design System V3 - Typography
			fontSize: fontSize,
			backdropBlur: blur,
			lineHeight: {
				0: '0',
			},
			gridTemplateRows: {
				'3-auto': 'repeat(3, auto)',
			},
		},
	},
	plugins: [],
} satisfies Config;
