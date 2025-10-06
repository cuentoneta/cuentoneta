// Core
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

// Tailwind
import { zinc, blue } from 'tailwindcss/colors';
import { ExtendedColors, extendedColors } from '../../../theme.config';

const AVAILABLE_COLORS = {
	zinc,
	blue,
} as const;

type AvailableColorKey = keyof typeof AVAILABLE_COLORS;

@Injectable({
	providedIn: 'root',
})
export class ThemeService {
	private meta = inject(Meta);
	private platformId = inject(PLATFORM_ID);

	/**
	 * Obtiene un color de TailwindCSS
	 * @param color - Nombre del color (ej: 'zinc', 'blue').
	 * @param scale - Escala del color (ej: 50, 100, 200...900).
	 * @returns Color en formato hexadecimal en mayúsculas.
	 * @throws Error si el color no está disponible o la escala no existe.
	 */
	pickColor(color: AvailableColorKey, scale: number = 50): string {
		const colorValue = AVAILABLE_COLORS[color];
		const scaleKey = scale.toString() as keyof typeof colorValue;
		const scaleValue = colorValue[scaleKey];

		if (!scaleValue) {
			throw new Error(`Scale ${scale} not found in color ${color}!`);
		}

		return (scaleValue as string).toUpperCase();
	}

	pickThemeColor(color: ExtendedColors) {
		if (!extendedColors[color]) {
			throw new Error(`Color ${color} not found in TailwindCSS config!`);
		}

		return extendedColors[color];
	}

	addThemeColorTag() {
		if (isPlatformBrowser(this.platformId)) {
			this.meta.addTag({ name: 'theme-color', content: extendedColors['primary-500'] });
		}
	}
}
