import { inject, Injectable, PLATFORM_ID } from '@angular/core';

// Tailwind
import colors from 'tailwindcss/colors';
import { DefaultColors } from 'tailwindcss/types/generated/colors';
import { Meta } from '@angular/platform-browser';

@Injectable({
	providedIn: 'root',
})
export class ThemeService {
	private meta = inject(Meta);
	private platform = inject(PLATFORM_ID);

	pickColor(color: keyof DefaultColors, scale: number = 50) {
		if (!colors[color]) {
			throw new Error(`Color ${color} not found in Tailwind CSS config!`);
		}

		// @ts-expect-error - Este guard chequea la existencia de la escala en el color
		if (!colors[color][scale.toString()]) {
			throw new Error(`Scale ${scale} not found in color ${color}!`);
		}

		// @ts-expect-error - En este punto tanto el color como la escala han sido validados
		return colors[color][scale.toString()].toUpperCase();
	}

	addThemeColorTag() {
		this.meta.addTag({ name: 'theme-color', content: 'hsl(21, 57%, 44%)' });
	}
}
