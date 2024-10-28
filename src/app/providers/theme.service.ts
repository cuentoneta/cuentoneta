// Core
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

// Tailwind
import * as defaultColors from 'tailwindcss/colors';
import { DefaultColors } from 'tailwindcss/types/generated/colors';
import { extendedColors } from '../../../theme.config';
import { screens } from '../../../tailwind.screens';

// Models
import { ContentCampaignViewport } from '@models/content-campaign.model';

@Injectable({
	providedIn: 'root',
})
export class ThemeService {
	private meta = inject(Meta);
	private platformId = inject(PLATFORM_ID);

	get viewport(): ContentCampaignViewport {
		// Para SSR, siempre devolver md dado que no se puede acceder a window
		if (isPlatformServer(this.platformId)) {
			return 'md';
		}

		const matcher = window.matchMedia(`(max-width: ${screens.md})`).matches;
		return matcher ? 'xs' : 'md';
	}

	pickColor(color: keyof DefaultColors, scale: number = 50) {
		if (!defaultColors[color]) {
			throw new Error(`Color ${color} not found in Tailwind CSS config!`);
		}

		// @ts-expect-error - Este guard chequea la existencia de la escala en el color
		if (!defaultColors[color][scale.toString()]) {
			throw new Error(`Scale ${scale} not found in color ${color}!`);
		}

		// @ts-expect-error - En este punto tanto el color como la escala han sido validados
		return defaultColors[color][scale.toString()].toUpperCase();
	}

	addThemeColorTag() {
		if (isPlatformBrowser(this.platformId)) {
			this.meta.addTag({ name: 'theme-color', content: extendedColors['primary-500'] });
		}
	}
}
