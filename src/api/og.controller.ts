import { html } from 'satori-html';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import type { ReactNode } from 'react';

import { getStoryBySlug } from './modules/story/story.service';
import { getBySlug as getStorylistBySlug } from './modules/storylist/storylist.service';
import { getAuthorBySlug } from './modules/author/author.service';
import { slugSchema } from './schemas/common.schemas';

const ogController = new Hono();

// Constantes
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const FONT_PATH = `${process.cwd()}/src/api/_utils/Inter-Medium.ttf`;
const FONT_DATA = readFileSync(FONT_PATH);
const CACHE_DIR = `${process.cwd()}/cache/og`;

// Crear directorio de caché si no existe
if (!existsSync(CACHE_DIR)) {
	mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * Genera una clave de caché única para tipo y slug
 */
function getCacheKey(type: string, slug: string): string {
	const hash = createHash('md5').update(`${type}-${slug}`).digest('hex');
	return `${CACHE_DIR}/${hash}.png`;
}

/**
 * Obtiene imagen del caché o genera una nueva
 */
async function getCachedOrGenerate(
	type: string,
	slug: string,
	generator: () => Promise<Buffer>,
): Promise<Buffer> {
	const cacheKey = getCacheKey(type, slug);

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
async function generateOgImage(markup: string): Promise<Buffer> {
	const svg: string = await satori(html(markup) as ReactNode, {
		width: OG_WIDTH,
		height: OG_HEIGHT,
		fonts: [
			{
				name: 'Inter',
				data: FONT_DATA,
				style: 'normal',
			},
		],
	});

	const resvg = new Resvg(svg, {
		fitTo: { mode: 'width', value: OG_WIDTH },
	});

	return resvg.render().asPng();
}

/**
 * Logo simplificado para OG images
 */
function SimpleLogo(): string {
	return `
    <div style="display: flex; align-items: center; gap: 12px;">
      <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="20" fill="white" opacity="0.95"/>
        <path d="M30 50 L50 30 L70 50 L50 70 Z" fill="#e17d6b"/>
        <circle cx="50" cy="50" r="8" fill="white"/>
      </svg>
      <span style="font-size: 28px; font-weight: 600; color: white;">La Cuentoneta</span>
    </div>
  `;
}

// Endpoint: Story OG Image
ogController.get('/story/:slug', zValidator('param', slugSchema), async (c) => {
	const { slug } = c.req.valid('param');

	try {
		const png = await getCachedOrGenerate('story', slug, async () => {
			const story = await getStoryBySlug(slug);

			if (!story) {
				throw new Error('Story not found');
			}

			const markup = `
        <div style="height: 100%; width: 100%; display: flex; flex-direction: column; background: linear-gradient(135deg, #e17d6b 0%, #d4665a 100%); padding: 60px;">
          <div style="display: flex; margin-bottom: 40px;">
            ${SimpleLogo()}
          </div>

          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
            <h1 style="font-size: 64px; color: white; margin: 0 0 20px 0; line-height: 1.2; max-width: 90%;">${story.title}</h1>
            <p style="font-size: 36px; color: rgba(255,255,255,0.9); margin: 0;">por ${story.author.name}</p>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <span style="font-size: 24px; color: white;">${story.author.nationality.flag} ${story.author.nationality.country}</span>
              <span style="font-size: 24px; color: white;">📖 ${story.approximateReadingTime} min</span>
            </div>
          </div>
        </div>
      `;

			return await generateOgImage(markup);
		});

		return c.body(png, 200, {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		});
	} catch (error) {
		return c.notFound();
	}
});

// Endpoint: Storylist OG Image
ogController.get('/storylist/:slug', zValidator('param', slugSchema), async (c) => {
	const { slug } = c.req.valid('param');

	try {
		const png = await getCachedOrGenerate('storylist', slug, async () => {
			const storylist = await getStorylistBySlug(slug, 100, 'asc');

			if (!storylist) {
				throw new Error('Storylist not found');
			}

			const tagsHtml =
				storylist.tags && storylist.tags.length > 0
					? `
          <div style="display: flex; gap: 15px; flex-wrap: wrap;">
            ${storylist.tags
							.slice(0, 3)
							.map(
								(tag) => `
              <span style="background: rgba(255,255,255,0.2); padding: 10px 20px; border-radius: 20px; font-size: 20px; color: white;">${tag.name}</span>
            `,
							)
							.join('')}
          </div>
        `
					: '';

			const markup = `
        <div style="height: 100%; width: 100%; display: flex; flex-direction: column; background: linear-gradient(135deg, #e17d6b 0%, #d4665a 100%); padding: 60px;">
          <div style="display: flex; margin-bottom: 40px;">
            ${SimpleLogo()}
          </div>

          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
            <h1 style="font-size: 64px; color: white; margin: 0 0 30px 0; line-height: 1.2; max-width: 90%;">${storylist.title}</h1>
            <p style="font-size: 32px; color: rgba(255,255,255,0.9); margin: 0;">Una colección de ${storylist.count} ${storylist.count === 1 ? 'historia' : 'historias'}</p>
          </div>

          ${tagsHtml}
        </div>
      `;

			return await generateOgImage(markup);
		});

		return c.body(png, 200, {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		});
	} catch (error) {
		return c.notFound();
	}
});

// Endpoint: Author OG Image
ogController.get('/author/:slug', zValidator('param', slugSchema), async (c) => {
	const { slug } = c.req.valid('param');

	try {
		const png = await getCachedOrGenerate('author', slug, async () => {
			const author = await getAuthorBySlug(slug);

			if (!author) {
				throw new Error('Author not found');
			}

			const yearRange = author.bornOnYear
				? `${author.bornOnYear}${author.diedOnYear ? ` - ${author.diedOnYear}` : ''}`
				: '';

			const markup = `
        <div style="height: 100%; width: 100%; display: flex; background: linear-gradient(135deg, #e17d6b 0%, #d4665a 100%); padding: 60px;">
          <div style="flex: 1; display: flex; flex-direction: column;">
            <div style="display: flex; margin-bottom: 40px;">
              ${SimpleLogo()}
            </div>

            <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
              <h1 style="font-size: 72px; color: white; margin: 0 0 20px 0; line-height: 1.1; max-width: 90%;">${author.name}</h1>
              <p style="font-size: 32px; color: rgba(255,255,255,0.9); margin: 0;">
                ${author.nationality.flag} ${author.nationality.country}
                ${yearRange ? ` • ${yearRange}` : ''}
              </p>
            </div>
          </div>
        </div>
      `;

			return await generateOgImage(markup);
		});

		return c.body(png, 200, {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=31536000, immutable',
		});
	} catch (error) {
		return c.notFound();
	}
});

export default ogController;
