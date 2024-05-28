import { Injectable } from '@angular/core';

// Tailwind
import colors from 'tailwindcss/colors';
import { DefaultColors } from 'tailwindcss/types/generated/colors';

@Injectable({
	providedIn: 'root',
})
export class ThemeService {
	pickColor(color: keyof DefaultColors, scale: number = 50) {
		return colors[color][200];
	}
}
