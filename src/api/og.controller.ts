import { html } from 'satori-html';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { ReactNode } from 'react';
import type { Context } from 'hono';

import { getStoryBySlug } from './modules/story/story.service';
import { getBySlug as getStorylistBySlug } from './modules/storylist/storylist.service';
import { getAuthorBySlug } from './modules/author/author.service';
import { slugSchema } from './schemas/common.schemas';

const ogController = new Hono();

// Constantes
const FONT_PATH = `${process.cwd()}/src/api/_utils/Inter-Medium.ttf`;
const FONT_DATA = readFileSync(FONT_PATH);
const CACHE_DIR = `${process.cwd()}/cache/og`;

// Crear directorio de caché si no existe
if (!existsSync(CACHE_DIR)) {
	mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Plataformas soportadas para OpenGraph
 */
type Platform = 'whatsapp' | 'twitter' | 'threads' | 'discord' | 'instagram' | 'default';

/**
 * Dimensiones de imagen por plataforma
 */
interface ImageDimensions {
	width: number;
	height: number;
	ratio: number;
}

/**
 * Configuración de dimensiones por plataforma
 */
const PLATFORM_DIMENSIONS: Record<Platform, ImageDimensions> = {
	whatsapp: { width: 1200, height: 630, ratio: 1.91 },
	twitter: { width: 1200, height: 675, ratio: 1.78 },
	threads: { width: 1080, height: 1080, ratio: 1.0 },
	instagram: { width: 1080, height: 1080, ratio: 1.0 },
	discord: { width: 1200, height: 630, ratio: 1.91 },
	default: { width: 1200, height: 630, ratio: 1.91 },
};

/**
 * Detecta la plataforma basándose en el User-Agent
 */
function detectPlatform(c: Context): Platform {
	const userAgent = c.req.header('user-agent')?.toLowerCase() || '';

	// WhatsApp
	if (userAgent.includes('whatsapp')) {
		return 'whatsapp';
	}

	// Twitter/X
	if (userAgent.includes('twitterbot') || userAgent.includes('twitter')) {
		return 'twitter';
	}

	// Threads (Meta, similar a Instagram)
	if (userAgent.includes('threads')) {
		return 'threads';
	}

	// Instagram
	if (userAgent.includes('instagram')) {
		return 'instagram';
	}

	// Discord
	if (userAgent.includes('discord')) {
		return 'discord';
	}

	return 'default';
}

/**
 * Obtiene las dimensiones de imagen para una plataforma
 */
function getDimensions(platform: Platform): ImageDimensions {
	return PLATFORM_DIMENSIONS[platform];
}

/**
 * Genera una clave de caché única para tipo, slug y plataforma
 */
function getCacheKey(type: string, slug: string, platform: Platform): string {
	const hash = createHash('md5').update(`${type}-${slug}-${platform}`).digest('hex');
	return `${CACHE_DIR}/${hash}.png`;
}

/**
 * Obtiene imagen del caché o genera una nueva
 */
async function getCachedOrGenerate(
	type: string,
	slug: string,
	platform: Platform,
	generator: () => Promise<Buffer>,
): Promise<Buffer> {
	const cacheKey = getCacheKey(type, slug, platform);

	// Verificar caché
	if (existsSync(cacheKey)) {
		return readFileSync(cacheKey);
	}

	// Generar
	const image = await generator();

	// Guardar en caché
	writeFileSync(cacheKey, image);

	return image;
}

/**
 * Genera una imagen PNG OpenGraph desde markup HTML
 */
async function generateOgImage(markup: string, dimensions: ImageDimensions): Promise<Buffer> {
	const svg: string = await satori(html(markup) as ReactNode, {
		width: dimensions.width,
		height: dimensions.height,
		fonts: [
			{
				name: 'Inter',
				data: FONT_DATA,
				style: 'normal',
			},
		],
	});

	const resvg = new Resvg(svg, {
		fitTo: { mode: 'width', value: dimensions.width },
	});

	return resvg.render().asPng();
}

/**
 * Logo simplificado para OG images
 */
function SimpleLogo(isSquare: boolean = false): string {
	const fontSize = isSquare ? '24px' : '28px';
	const iconSize = isSquare ? '40' : '48';

	return `
    <div style="display: flex; align-items: center; gap: ${isSquare ? '8px' : '12px'};">
      <svg width="${iconSize}" height="${iconSize}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="white" opacity="0.95"/>
        <path d="M30 50 L50 30 L70 50 L50 70 Z" fill="#e17d6b"/>
        <circle cx="50" cy="50" r="8" fill="white"/>
      </svg>
      <span style="font-size: ${fontSize}; font-weight: 600; color: white;">La Cuentoneta</span>
    </div>
  `;
}

/**
 * Genera el markup para una story según las dimensiones
 */
function generateStoryMarkup(story: any, dimensions: ImageDimensions): string {
	const isSquare = dimensions.ratio === 1.0;
	const titleSize = isSquare ? '52px' : '64px';
	const subtitleSize = isSquare ? '28px' : '36px';
	const metaSize = isSquare ? '20px' : '24px';
	const padding = isSquare ? '40px' : '60px';

	return `
    <div style="height: 100%; width: 100%; display: flex; flex-direction: column; background: linear-gradient(135deg, #e17d6b 0%, #d4665a 100%); padding: ${padding};">
      <div style="display: flex; margin-bottom: ${isSquare ? '30px' : '40px'};">
        ${SimpleLogo(isSquare)}
      </div>

      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="font-size: ${titleSize}; color: white; margin: 0 0 ${isSquare ? '15px' : '20px'} 0; line-height: 1.2; max-width: 90%;">${story.title}</h1>
        <p style="font-size: ${subtitleSize}; color: rgba(255,255,255,0.9); margin: 0;">por ${story.author.name}</p>
      </div>

      <div style="display: flex; ${isSquare ? 'flex-direction: column; gap: 10px;' : 'justify-content: space-between;'} align-items: ${isSquare ? 'flex-start' : 'center'};">
        <div style="display: flex; align-items: center; gap: ${isSquare ? '15px' : '20px'}; flex-wrap: wrap;">
          <span style="font-size: ${metaSize}; color: white;">${story.author.nationality.flag} ${story.author.nationality.country}</span>
          <span style="font-size: ${metaSize}; color: white;">📖 ${story.approximateReadingTime} min</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Genera el markup para una storylist según las dimensiones
 */
function generateStorylistMarkup(storylist: any, dimensions: ImageDimensions): string {
	const isSquare = dimensions.ratio === 1.0;
	const titleSize = isSquare ? '52px' : '64px';
	const subtitleSize = isSquare ? '26px' : '32px';
	const tagSize = isSquare ? '16px' : '20px';
	const padding = isSquare ? '40px' : '60px';

	const tagsHtml =
		storylist.tags && storylist.tags.length > 0
			? `
      <div style="display: flex; gap: ${isSquare ? '10px' : '15px'}; flex-wrap: wrap;">
        ${storylist.tags
					.slice(0, isSquare ? 2 : 3)
					.map(
						(tag: any) => `
          <span style="background: rgba(255,255,255,0.2); padding: ${isSquare ? '8px 16px' : '10px 20px'}; border-radius: 20px; font-size: ${tagSize}; color: white;">${tag.name}</span>
        `,
					)
					.join('')}
      </div>
    `
			: '';

	return `
    <div style="height: 100%; width: 100%; display: flex; flex-direction: column; background: linear-gradient(135deg, #e17d6b 0%, #d4665a 100%); padding: ${padding};">
      <div style="display: flex; margin-bottom: ${isSquare ? '30px' : '40px'};">
        ${SimpleLogo(isSquare)}
      </div>

      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="font-size: ${titleSize}; color: white; margin: 0 0 ${isSquare ? '20px' : '30px'} 0; line-height: 1.2; max-width: 90%;">${storylist.title}</h1>
        <p style="font-size: ${subtitleSize}; color: rgba(255,255,255,0.9); margin: 0;">Una colección de ${storylist.count} ${storylist.count === 1 ? 'historia' : 'historias'}</p>
      </div>

      ${tagsHtml}
    </div>
  `;
}

/**
 * Genera el markup para un author según las dimensiones
 */
function generateAuthorMarkup(author: any, dimensions: ImageDimensions): string {
	const isSquare = dimensions.ratio === 1.0;
	const titleSize = isSquare ? '56px' : '72px';
	const subtitleSize = isSquare ? '26px' : '32px';
	const padding = isSquare ? '40px' : '60px';

	const yearRange = author.bornOnYear
		? `${author.bornOnYear}${author.diedOnYear ? ` - ${author.diedOnYear}` : ''}`
		: '';

	return `
    <div style="height: 100%; width: 100%; display: flex; background: linear-gradient(135deg, #e17d6b 0%, #d4665a 100%); padding: ${padding};">
      <div style="flex: 1; display: flex; flex-direction: column;">
        <div style="display: flex; margin-bottom: ${isSquare ? '30px' : '40px'};">
          ${SimpleLogo(isSquare)}
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <h1 style="font-size: ${titleSize}; color: white; margin: 0 0 ${isSquare ? '15px' : '20px'} 0; line-height: 1.1; max-width: 90%;">${author.name}</h1>
          <p style="font-size: ${subtitleSize}; color: rgba(255,255,255,0.9); margin: 0;">
            ${author.nationality.flag} ${author.nationality.country}
            ${yearRange ? ` • ${yearRange}` : ''}
          </p>
        </div>
      </div>
    </div>
  `;
}

// Endpoint: Story OG Image
ogController.get('/story/:slug', zValidator('param', slugSchema), async (c) => {
	const { slug } = c.req.valid('param');
	const platform = detectPlatform(c);
	const dimensions = getDimensions(platform);

	try {
		const png = await getCachedOrGenerate('story', slug, platform, async () => {
			const story = await getStoryBySlug(slug);

			if (!story) {
				throw new Error('Story not found');
			}

			const markup = generateStoryMarkup(story, dimensions);
			return await generateOgImage(markup, dimensions);
		});

		return c.body(png, 200, {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
			'X-OG-Platform': platform,
			'X-OG-Dimensions': `${dimensions.width}x${dimensions.height}`,
		});
	} catch (error) {
		return c.notFound();
	}
});

// Endpoint: Storylist OG Image
ogController.get('/storylist/:slug', zValidator('param', slugSchema), async (c) => {
	const { slug } = c.req.valid('param');
	const platform = detectPlatform(c);
	const dimensions = getDimensions(platform);

	try {
		const png = await getCachedOrGenerate('storylist', slug, platform, async () => {
			const storylist = await getStorylistBySlug(slug, 100, 'asc');

			if (!storylist) {
				throw new Error('Storylist not found');
			}

			const markup = generateStorylistMarkup(storylist, dimensions);
			return await generateOgImage(markup, dimensions);
		});

		return c.body(png, 200, {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
			'X-OG-Platform': platform,
			'X-OG-Dimensions': `${dimensions.width}x${dimensions.height}`,
		});
	} catch (error) {
		return c.notFound();
	}
});

// Endpoint: Author OG Image
ogController.get('/author/:slug', zValidator('param', slugSchema), async (c) => {
	const { slug } = c.req.valid('param');
	const platform = detectPlatform(c);
	const dimensions = getDimensions(platform);

	try {
		const png = await getCachedOrGenerate('author', slug, platform, async () => {
			const author = await getAuthorBySlug(slug);

			if (!author) {
				throw new Error('Author not found');
			}

			const markup = generateAuthorMarkup(author, dimensions);
			return await generateOgImage(markup, dimensions);
		});

		return c.body(png, 200, {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
			'X-OG-Platform': platform,
			'X-OG-Dimensions': `${dimensions.width}x${dimensions.height}`,
		});
	} catch (error) {
		return c.notFound();
	}
});

export default ogController;
