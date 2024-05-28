import { Injectable } from '@angular/core';

// Tailwind
import colors from 'tailwindcss/colors';
import { DefaultColors } from 'tailwindcss/types/generated/colors';

@Injectable({
	providedIn: 'root',
})
export class ThemeService {
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
}
