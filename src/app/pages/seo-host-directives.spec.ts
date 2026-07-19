import { readFileSync } from 'fs';
import { join } from 'path';

import { Type } from '@angular/core';
import { RenderMode } from '@angular/ssr';

import { appRoutes } from '../app.routes';
import { serverRoutes } from '../app.routes.server';
import { extractHostDirectiveNames, extractRobotsLiteral } from './seo-host-directives.util';

import HomeComponent from './home/home.component';
import AuthorComponent from './author/author.component';
import StoryComponent from './story/story.component';
import StorylistComponent from './storylist/storylist.component';
import AuthorsComponent from './authors/authors.component';
import StoriesComponent from './stories/stories.component';
import AboutComponent from './about/about.component';
import DmcaComponent from './dmca/dmca.component';

// Guardrail estructural (#1726): garantiza que toda página con una ruta indexable (RenderMode.Server/Prerender,
// sin noindex) declare sus directivas de SEO. No usa Angular Testing Library a propósito: no hay UI que ejercitar,
// es un test de convención de código sobre el mapeo ruta→RenderMode→componente, que cruza tres archivos
// (app.routes.ts, app.routes.server.ts y el fuente del componente). Ver `angular-state.md` para la convención.

type PageSeoEntry = Readonly<{ component: Type<unknown>; sourceFile: string; indexable: boolean }>;

// Clasificación explícita de cada página. `indexable: true` exige el combo MetaTags + StructuredData;
// `indexable: false` exige el opt-out HeadMetadataDirective + setRobots('noindex...').
const PAGE_SEO_REGISTRY: readonly PageSeoEntry[] = [
	{ component: HomeComponent, sourceFile: 'home/home.component.ts', indexable: true },
	{ component: AuthorComponent, sourceFile: 'author/author.component.ts', indexable: true },
	{ component: StoryComponent, sourceFile: 'story/story.component.ts', indexable: true },
	{ component: StorylistComponent, sourceFile: 'storylist/storylist.component.ts', indexable: true },
	{ component: AuthorsComponent, sourceFile: 'authors/authors.component.ts', indexable: false },
	{ component: StoriesComponent, sourceFile: 'stories/stories.component.ts', indexable: false },
	{ component: AboutComponent, sourceFile: 'about/about.component.ts', indexable: false },
	{ component: DmcaComponent, sourceFile: 'dmca/dmca.component.ts', indexable: false },
];

// Nuestras rutas resuelven el componente vía `() => import(...)`, así que loadComponent() siempre entrega el
// módulo con `default`. El cast descarta las ramas Observable/Type-directo de la firma que este repo no usa.
type LoadedComponent = Type<unknown> | { default: Type<unknown> };

function isIndexableRenderMode(mode: RenderMode): boolean {
	return mode === RenderMode.Server || mode === RenderMode.Prerender;
}

function resolveRouteComponent(loaded: LoadedComponent): Type<unknown> {
	return 'default' in loaded ? loaded.default : loaded;
}

function readPageSource(sourceFile: string): string {
	return readFileSync(join(process.cwd(), 'src', 'app', 'pages', sourceFile), 'utf-8');
}

describe('SEO host directives guardrail', () => {
	it('should register every indexable-mode page route in PAGE_SEO_REGISTRY', async () => {
		for (const serverRoute of serverRoutes) {
			if (serverRoute.path === '**' || !isIndexableRenderMode(serverRoute.renderMode)) {
				continue;
			}
			const appRoute = appRoutes.find((route) => route.path === serverRoute.path);
			if (!appRoute?.loadComponent) {
				throw new Error(
					`Ruta '${serverRoute.path}' está en app.routes.server.ts pero no tiene un loadComponent en app.routes.ts`,
				);
			}
			const component = resolveRouteComponent((await appRoute.loadComponent()) as LoadedComponent);
			const entry = PAGE_SEO_REGISTRY.find((candidate) => candidate.component === component);
			expect(
				entry,
				`Ruta '${serverRoute.path}' (${component.name}) no está registrada en seo-host-directives.spec.ts — agregá su componente al registro y decidí si es indexable`,
			).toBeDefined();
		}
	});

	describe.each(PAGE_SEO_REGISTRY)('$sourceFile', (entry) => {
		const source = readPageSource(entry.sourceFile);
		const hostDirectives = extractHostDirectiveNames(source);

		if (entry.indexable) {
			it('should declare a MetaTags + StructuredData host directive combo', () => {
				const detail = `${entry.component.name} es indexable pero hostDirectives = [${hostDirectives.join(', ')}]`;
				expect(
					hostDirectives.some((name) => /MetaTagsDirective$/.test(name)),
					`${detail}: falta una <Page>MetaTagsDirective`,
				).toBe(true);
				expect(
					hostDirectives.some((name) => /StructuredDataDirective$/.test(name)),
					`${detail}: falta una <Page>StructuredDataDirective`,
				).toBe(true);
			});
		} else {
			it('should opt out of indexing with HeadMetadataDirective + setRobots(noindex)', () => {
				expect(
					hostDirectives,
					`${entry.component.name} está registrado indexable: false pero hostDirectives = [${hostDirectives.join(', ')}]`,
				).toEqual(['HeadMetadataDirective']);
				expect(
					extractRobotsLiteral(source),
					`${entry.component.name} está registrado indexable: false pero no llama setRobots('noindex...') — el opt-out no está wireado en el código`,
				).toContain('noindex');
			});
		}
	});
});
