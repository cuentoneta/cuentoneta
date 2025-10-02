// Core
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

// Tailwind
// Importamos solo los colores usados en la app para evitar warnings de colores deprecados
// Si necesitas más colores, agrégalos aquí siguiendo el mismo patrón
import { zinc, blue } from 'tailwindcss/colors';
import { ExtendedColors, extendedColors } from '../../../theme.config';

// Registro de colores disponibles
// Para agregar un color nuevo: 1) añadir al import arriba, 2) añadir aquí
const AVAILABLE_COLORS = {
	zinc,
	blue,
	// Agrega más colores aquí cuando los necesites
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

		if (!colorValue) {
			const availableColors = Object.keys(AVAILABLE_COLORS).join(', ');
			throw new Error(
				`Color "${color}" no está disponible. Colores disponibles: ${availableColors}. ` +
					`Para agregar más colores, edita theme.service.ts.`,
			);
		}

		// Los colores de Tailwind son objetos con escalas (50, 100, 200, etc.)
		if (typeof colorValue === 'object' && colorValue !== null) {
			const scaleKey = scale.toString() as keyof typeof colorValue;
			const scaleValue = colorValue[scaleKey];

			if (!scaleValue) {
				throw new Error(`¡Escala ${scale} no encontrada en color ${color}!`);
			}

			return (scaleValue as string).toUpperCase();
		}

		// Colores especiales sin escala (inherit, transparent, etc.) - poco común
		return (colorValue as string).toUpperCase();
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
