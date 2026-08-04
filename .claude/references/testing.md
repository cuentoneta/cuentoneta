# Testing — La Cuentoneta

> Referencia detallada de testing. En `CLAUDE.md` viven el stack ([Resumen del proyecto](../../CLAUDE.md#resumen-del-proyecto)) y la obligación de usar los wrappers de `@test-utils` en lugar de `vi.*` ([Restricciones duras](../../CLAUDE.md#restricciones-duras-hard-constraints)); este archivo profundiza en patrones y ejemplos.
>
> **Idioma:** documentación en español; **código e identificadores en inglés**.

---

## Stack y configuración

| Aspecto          | Valor                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------- |
| **Runner**       | **Vitest** (`pnpm test` / `pnpm test:watch` / `pnpm test:ui`)                            |
| **Entorno**      | `happy-dom`, Angular **zoneless** (sin `zone.js`)                                        |
| **Componentes**  | **Angular Testing Library** (`@testing-library/angular`) + `@testing-library/user-event` |
| **Matchers DOM** | `@testing-library/jest-dom` — **no es Jest** (ver abajo)                                 |
| **Mocks/timers** | Wrappers de **`@test-utils`** (`src/test-utils.ts`)                                      |
| **Compilación**  | `@analogjs/vite-plugin-angular` (JIT en tests)                                           |

> **`@testing-library/jest-dom` no tiene relación con Jest.** El nombre viene de su origen, pero es una librería de matchers de DOM —`toBeInTheDocument`, `toHaveClass`, `toHaveAttribute`…— que se registra para Vitest en `src/test-setup.ts` (`import '@testing-library/jest-dom/vitest'`) y es parte del stack recomendado de Testing Library. Al barrer residuos de Jest del workspace, **no** es uno de ellos.

Archivos clave:

- **`vitest.config.ts`** — `globals: true`, `environment: 'happy-dom'`, `setupFiles: ['src/test-setup.ts']`, `include: ['src/**/*.{test,spec}.ts']`. Inlina `@sanity` y bundles `fesm` para que Vite los transforme. Coverage solo en CI (`CI=true`/`COVERAGE=true`).
- **`src/test-setup.ts`** — inicializa el `TestBed` zoneless (Angular 22 corre zoneless por defecto cuando `zone.js` no está presente; no se llama a `provideZonelessChangeDetection()`). El `ErrorHandler` **relanza** cualquier error no manejado para que falle el test. Instala el stub global de `IntersectionObserver`.
- **`src/test-utils.ts`** — los wrappers obligatorios (ver abajo).

> Esta es la config de **la app** (`@cuentoneta/app`). El Studio de Sanity (`cms/`) tiene su propia config de Vitest, independiente — ver [Segunda config de Vitest: el Studio (`cms/`)](#segunda-config-de-vitest-el-studio-cms).

---

## Regla dura: nada de `vi.*` directo

ESLint (`viRestrictedSyntax` en `eslint.config.mjs`) **prohíbe** usar `vi.fn()`, `vi.spyOn()`, `vi.useFakeTimers()`, `vi.clearAllMocks()`, etc. directamente en los specs. **`src/test-utils.ts` es la única excepción** (es el wrapper que el resto del repo consume).

Importá siempre desde `@test-utils`:

| Export                           | Reemplaza a                       |
| -------------------------------- | --------------------------------- |
| `fn`                             | `vi.fn`                           |
| `spyOn`                          | `vi.spyOn`                        |
| `clearAllMocks()`                | `vi.clearAllMocks()`              |
| `resetAllMocks()`                | `vi.resetAllMocks()`              |
| `restoreAllMocks()`              | `vi.restoreAllMocks()`            |
| `useFakeTimers()`                | `vi.useFakeTimers()`              |
| `useRealTimers()`                | `vi.useRealTimers()`              |
| `advanceTimersByTime(ms)`        | `vi.advanceTimersByTime(ms)`      |
| `advanceTimersByTimeAsync(ms)`   | `vi.advanceTimersByTimeAsync(ms)` |
| `runOnlyPendingTimers()`         | `vi.runOnlyPendingTimers()`       |
| `setSystemTime(t)`               | `vi.setSystemTime(t)`             |
| `type Mock`, `type MockInstance` | tipos del runner                  |

`fn()` es genérico: `fn<[number], Promise<User>>()`. Para castear una función auto-mockeada por `vi.mock` usá `as Mock` importado de `@test-utils` (nunca `vi.mocked()`, también prohibido).

```typescript
import { clearAllMocks } from '@test-utils';

beforeEach(() => {
	clearAllMocks(); // resetea el historial de llamadas entre tests
});
```

---

## Regla dura: el corpus se consume por colecciones, nunca por obra

ESLint (`no-single-work-corpus-imports` en `eslint.config.mjs`) **prohíbe** importar una obra puntual del corpus (`@mocks/onoff/<slug>.mock`, `<slug>.raw.mock`, `<slug>.literary-work.raw.mock`, `<slug>.collection.raw.mock`) desde cualquier archivo fuera de `src/mocks/**` — los agregadores son justamente quienes las importan.

Un spec o una story que importa una obra concreta queda atado a ella: sus aserciones citan la prosa de esa obra y enriquecer el canon no las alcanza. Las colecciones y los **selectores por capacidad** declaran el shape que el caso necesita y crecen solos.

| Necesitás…                                | Importá                                                                                               |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Una obra cualquiera                       | `onoffLiteraryWorksMock` (o `onoffRawLiteraryWorksMock` en el backend), y desestructurá la primera    |
| Una obra con título de sección            | `onoffLiteraryWorksWithSectionTitles`                                                                 |
| Una obra con epígrafes                    | `onoffLiteraryWorksWithEpigraphs` / `onoffRawLiteraryWorksWithEpigraphs`                              |
| Una obra con o sin nota editorial         | `onoffLiteraryWorksWith(out)EditorialNote` / `onoffRawLiteraryWorksWith(out)EditorialNote`            |
| Un texto con atribución (epígrafe o nota) | `onoffLiteraryWorkEpigraphsMock`; en stories, `corpusAttributedTexts` + `attributedTextSelectArgType` |
| Una story o colección crudas              | `onoffRawStoriesMock`, `onoffRawCollectionsMock`, `onoffRawNavCollectionsMock`                        |
| Una story o teaser crudos con multimedia  | `onoffRawStoriesWithMediaSources` / `onoffRawTeasersWithMediaSources`                                 |
| Una obra con o sin etiquetas              | `onoffRawLiteraryWorksWith(out)Tags`                                                                  |
| Una etiqueta cualquiera                   | `onoffTagsMock` (o `onoffRawTagsMock` en el backend), y tomá un slice                                 |
| Etiquetas de título corto                 | `onoffTagsWithShortTitles` — para stories donde un título de dos palabras fuerza el recorte por ancho |

Corolario: **las aserciones se derivan del fixture**, no de prosa clavada. Si el caso necesita una palabra del texto, extraela del propio mock (`bodyHtml.replace(/<[^>]+>/g, ' ')` y tomá una palabra) en vez de escribirla a mano — así sigue pasando cuando el canon cambie. Si falta un selector para el shape que necesitás, **agregalo al agregador** (derivado por predicado, no una lista en paralelo) en vez de importar la obra.

---

## Componentes: Angular Testing Library

### Reglas core

1. **Siempre ATL.** `render()` + queries de `screen`. **Nunca** `ComponentFixture`, `TestBed.createComponent()`, ni acceso por `querySelector` / `container`.
2. **Testear comportamiento de usuario, no implementación.** Buscá por rol/texto/label como lo haría una persona; no por clases CSS ni estructura interna.
3. **`clearAllMocks()` en `beforeEach`.**
4. Interacciones con `userEvent` (`@testing-library/user-event`), no con eventos sintéticos crudos.

### Patrón básico

```typescript
import { render, screen } from '@testing-library/angular';
import { TagComponent } from './tag.component';

describe('TagComponent', () => {
	it('should display the label', async () => {
		await render(TagComponent, {
			inputs: { label: 'Crónica', variant: 'soft' },
		});

		expect(screen.getByText('Crónica')).toBeInTheDocument();
	});
});
```

Para inputs se usa `inputs: { ... }`; para proyectar plantilla con bindings, la sobrecarga string de `render('<cuentoneta-... />', { imports, componentProperties })`.

### Interacciones de usuario

```typescript
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

it('should react to a click', async () => {
	const user = userEvent.setup();
	await render(MyComponent);

	await user.click(screen.getByRole('button', { name: /enviar/i }));

	expect(screen.getByText('Enviado')).toBeInTheDocument();
});
```

### Asíncrono

`findBy*` y `waitFor` tienen espera incorporada; preferilos a esperas manuales.

```typescript
const heading = await screen.findByRole('heading', { name: /bienvenida/i });
expect(heading).toBeInTheDocument();
```

### Servicios inyectados (mock con `fn()`)

> Ejemplo con `StoryApi`/`StoryComponent`. Cuando el doble no necesita registrar llamadas, se provee la clase `Stub*` del propio provider en vez de `fn()` — es lo que hace `read.page.spec.ts` con `StubLiteraryWorkApi` + `provideLiteraryWorkApiMock()`.

```typescript
import { fn } from '@test-utils';
import { of, type Observable } from 'rxjs';

const getBySlug = fn<[string], Observable<Story>>();
getBySlug.mockReturnValue(of(storyMock));

await render(StoryComponent, {
	providers: [{ provide: StoryApi, useValue: { getBySlug } }],
});

expect(await screen.findByText(storyMock.title)).toBeInTheDocument();
```

---

## Prioridad de queries

Elegí la query **más alta** de la tabla que aplique. `getByTestId` es el último recurso (no es accesible para usuarios reales).

| Prioridad | Query                  | Cuándo                                           |
| --------- | ---------------------- | ------------------------------------------------ |
| 1         | `getByRole`            | Casi siempre (botones, links, headings, inputs)  |
| 2         | `getByLabelText`       | Campos de formulario con label                   |
| 3         | `getByPlaceholderText` | Inputs sin label (preferí dar label)             |
| 4         | `getByText`            | Texto no interactivo                             |
| 5         | `getByDisplayValue`    | Valor actual de un input                         |
| 6         | `getByAltText`         | Imágenes / `area` / `input[type=image]`          |
| 7         | `getByTitle`           | Elementos con `title`                            |
| 8         | `getByTestId`          | Último recurso, cuando nada de lo anterior sirve |

Variantes: `queryBy*` (cuando se espera ausencia, no lanza), `findBy*` (async, espera).

---

## `IntersectionObserver` en tests

`happy-dom` no implementa `IntersectionObserver`. `src/test-setup.ts` instala un **stub global** (`src/testing/intersection-observer.stub.ts`) para que cualquier componente que use IO se pueda renderizar.

Los specs que necesitan **simular overflow** (p. ej. `TagsListComponent` / `TagsOverflowDirective`, que recorta tags por ancho con `IntersectionObserver`) reutilizan los helpers del mismo stub:

| Helper                              | Efecto                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------- |
| `installIntersectionObserverStub()` | (Re)instala el stub y resetea el callback capturado                    |
| `markOutsideViewport(...els)`       | Simula que esos elementos quedaron fuera del contenedor                |
| `markInsideViewport(...els)`        | Simula que volvieron a entrar completos                                |
| `lastObserverOptions()`             | Opciones del último observer creado (p. ej. inspeccionar `rootMargin`) |

```typescript
import { render, screen } from '@testing-library/angular';
import { installIntersectionObserverStub, markOutsideViewport } from '../../testing/intersection-observer.stub';

describe('TagsOverflowDirective', () => {
	beforeEach(() => installIntersectionObserverStub());

	it('should hide the tags the observer reports outside the container', async () => {
		const { fixture } = await renderHost(['A', 'B', 'C', 'D', 'E']);

		markOutsideViewport(screen.getByText('D'), screen.getByText('E'));
		await fixture.whenStable();

		expect(screen.getByTestId('counter')).toHaveTextContent('+2');
		expect(screen.getByText('E')).toHaveStyle({ visibility: 'hidden' });
	});
});
```

> Nota: el stub es temporal. El browser mode de Vitest provee un `IntersectionObserver` real, lo que permitiría testear con layout real en vez de simular el callback a mano.

---

## Timers

Usá siempre los wrappers de `@test-utils`, nunca `vi.useFakeTimers()` directo.

```typescript
import { advanceTimersByTime, useFakeTimers, useRealTimers } from '@test-utils';

beforeEach(() => useFakeTimers());
afterEach(() => useRealTimers());

it('should debounce', () => {
	triggerAction();
	advanceTimersByTime(300);
	expect(result).toBe(expected);
});
```

Para flujos asíncronos junto a timers, `advanceTimersByTimeAsync(ms)`.

---

## Backend (Hono): tests funcionales con module mocking

El backend (`src/api/modules/<dominio>/`) sigue **controller → service → repository** con **Hono plano** y **todavía no tiene inyección de dependencias**. Por eso, los specs de service/repository mockean el módulo del repository con **`vi.mock`**, que normalmente está prohibido.

**Patrón actual** (autorizado mediante `eslint-disable` puntual y comentado):

```typescript
import { clearAllMocks, type Mock } from '@test-utils';
import * as sitemapRepository from './sitemap.repository';
import { getSitemapUrls } from './sitemap.service';

/* eslint-disable no-restricted-syntax -- vi.mock/vi.fn: mock de módulo del repository; se migra a inyección de dependencias en #1503 */
vi.mock('./sitemap.repository', () => ({
	fetchSitemapSlugs: vi.fn(),
}));
/* eslint-enable no-restricted-syntax */

describe('SitemapService', () => {
	beforeEach(() => {
		clearAllMocks();
		process.env['BASE_URL'] = 'https://test.cuentoneta.ar';
	});

	it('should include story URLs', async () => {
		(sitemapRepository.fetchSitemapSlugs as Mock).mockResolvedValue({
			stories: [{ slug: 'el-aleph', lastmod: '2025-01-01' }],
			authors: [],
			storylists: [],
		});

		const urls = await getSitemapUrls();
		expect(urls).toContainEqual(expect.objectContaining({ loc: 'https://test.cuentoneta.ar/story/el-aleph' }));
	});
});
```

Reglas del patrón:

- El `vi.mock(...)` va envuelto en un bloque `/* eslint-disable no-restricted-syntax -- ... */` … `/* eslint-enable ... */` con **justificación y referencia a #1503**.
- La función auto-mockeada se castea con `as Mock` importado de `@test-utils` (no `vi.mocked()`).
- `clearAllMocks()` en `beforeEach`; limpiar `process.env` en `afterEach` si se setea.
- Testear **comportamiento de la función** (entrada → salida), agrupando por función en `describe` anidados.

> **Nota (deuda técnica #1503):** este es un patrón _transitorio_. El module mocking es necesario solo porque el backend carece de DI. Cuando se migre a inyección de dependencias, estos `vi.mock` + `eslint-disable` desaparecen a favor de dobles inyectados. **No** extender este patrón a código frontend.

---

## Segunda config de Vitest: el Studio (`cms/`)

`cms/` (el Studio de Sanity) tiene su **propia config de Vitest** (`cms/vitest.config.ts`), independiente de la de la app. Se corre con `pnpm sanity:test` desde la raíz (o `pnpm -C cms test`), y es el paso `Test Sanity Studio` del gate `studio-build` — junto con el paso previo `Typecheck Sanity Studio` (`pnpm sanity:typecheck` / `pnpm -C cms run typecheck`) — ver [Comandos comunes](../../CLAUDE.md#comandos-comunes).

### Qué cubre y qué no

Cubre **lógica Node pura del Studio**: resolvers de Desk Structure, utils que corren dentro del proceso del Studio (p. ej. `cms/utils/landing-page.ts`). No hay nada de Angular, ni Angular Testing Library, ni `happy-dom` — el Studio no renderiza componentes Angular ni corre en un DOM simulado con esa configuración.

### Por qué es una config aparte

`cms/` es un **proyecto pnpm standalone**, con su propio árbol de `node_modules` y su propio `package.json`. La config raíz de Vitest carga `@analogjs/vite-plugin-angular`, que no tiene nada que resolver ahí. Un `include` adicional en el `vitest.config.ts` de la raíz correría por fuera del entorno de `cms/` y arrastraría ese plugin sin necesidad.

### Convenciones propias (no las de `@test-utils`)

- Los specs de `cms/` **importan `describe`/`it`/`expect` de `vitest` explícitamente** (`cms/vitest.config.ts` no declara `globals`), a diferencia de los specs de la app.
- **No usan `@test-utils`.** Esos wrappers viven en el árbol de `node_modules` de la app; arrastrarlos a `cms/` acoplaría dos proyectos pnpm por casos que se resuelven con diez líneas.
- Los dobles se escriben **a mano**, siguiendo la misma taxonomía por comportamiento del resto del repo — `Stub*`/`Fake*`/`Spy*`, **nunca** `Mock*` (ver [Naming](../../CLAUDE.md#naming)). El ejemplo vigente es `SpyGroqClient` en `cms/utils/landing-page.spec.ts`: registra la query y los params con los que se lo invocó, sin depender de `vi.fn()`.
- `cms/` **sí** está cubierto por ESLint (el target `eslint:lint` de `project.json` corre sobre `./src ./e2e ./resources ./cms`) y por su propio type-check (`cms/tsconfig.typecheck.json`, dentro del gate `studio-build`). Lo que sigue sin tener es `@test-utils`: los specs de `cms/` se mantienen deliberadamente simples, sin abstracciones de test propias y con dobles chicos anotados a mano.

```typescript
import { describe, expect, it } from 'vitest';
import { buildWeekSlug } from '@utils/week-slug.utils';
import { ACTIVE_LANDING_ID_QUERY, resolveActiveLandingId } from './landing-page';

class SpyGroqClient {
	query: string | null = null;
	params: Record<string, unknown> | null = null;

	constructor(private readonly result: unknown) {}

	fetch<T>(query: string, params?: Record<string, unknown>): Promise<T> {
		this.query = query;
		this.params = params ?? null;
		return this.result instanceof Error ? Promise.reject(this.result) : Promise.resolve(this.result as T);
	}
}

describe('resolveActiveLandingId', () => {
	it('queries the active landing with the ISO week of the given date', async () => {
		const client = new SpyGroqClient('landing-page-current');

		await resolveActiveLandingId(client, new Date(2025, 10, 14));

		expect(client.query).toBe(ACTIVE_LANDING_ID_QUERY);
	});
});
```

### El kernel (`@models`/`@utils`) también es consumible desde `cms/`

El kernel compartido de paths (`@models/*`, `@utils/*` — ver [Aliases de paths](../../CLAUDE.md#resumen-del-proyecto)) no es exclusivo de `src/`: el Studio también lo consume (p. ej. `cms/utils/landing-page.ts` importa `buildWeekSlug` de `@utils/week-slug.utils`). Como `cms/` es un proyecto pnpm standalone con su propio tooling, el alias hay que declararlo en **cuatro** lugares independientes, cada uno con su propio resolutor:

| Lugar                         | Quién lo lee                        | Por qué no alcanza con uno solo                                                                              |
| ----------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `cms/sanity.cli.ts`           | El bundler del Studio (Vite/Rollup) | Es lo que hace que `sanity dev`/`sanity build` resuelvan el alias                                            |
| `cms/vitest.config.ts`        | Vitest                              | Vitest **no** lee `sanity.cli.ts`; hay que repetir el `alias` ahí                                            |
| `cms/tsconfig.json`           | El editor / IntelliSense y `tsc`    | Ya no es solo decorativo: `cms/tsconfig.typecheck.json` lo **extiende**, así que también alimenta el gate    |
| `cms/tsconfig.typecheck.json` | `tsc` en el gate `studio-build`     | Extiende `tsconfig.json` pero agrega lo propio de una corrida de `tsc` (`noEmit`, `include` de `.tsx`, etc.) |

Si falta declararlo en alguno de los cuatro, el síntoma es puntual a esa herramienta: el editor marca error pero el build pasa, el build falla pero el editor no se queja, los tests fallan al resolver el import mientras el resto compila bien, o el step de type-check del gate `studio-build` corta el CI sin que nada local lo haya anticipado.

#### Las dependencias del kernel también hay que aliasarlas

Si el archivo del kernel que consume el Studio importa un paquete (`date-fns`, por ejemplo), ese bare import se resuelve **desde el archivo que lo importa** — o sea desde `src/**`, fuera de `cms/`. En CI eso falla: el job del Studio hace checkout propio e instala **solo** `cms/`, así que `<repo>/node_modules` no existe y Rollup corta el build con `Failed to resolve import`. Lo mismo le pasa a `tsc`: resuelve el bare import subiendo hasta el `node_modules` de la raíz, que en el job del Studio tampoco existe.

Por eso cada paquete que el kernel importe tiene que estar declarado como dependencia de `cms/package.json` **y** aliasado a `cms/node_modules/<paquete>` en `sanity.cli.ts`, `vitest.config.ts` **y** en los `paths` de `cms/tsconfig.json` (heredados por `tsconfig.typecheck.json`).

**Este es el modo de falla más traicionero de todo el cruce de límites, porque no se reproduce en local por ningún medio:** cualquier checkout del repo tiene un `node_modules` en la raíz, y la resolución sube hasta encontrarlo. Un worktree bajo `.claude/worktrees/` es todavía peor, porque sube hasta el `node_modules` del checkout principal aunque se esconda el propio. La única señal es el gate `studio-build` en CI.

---

## Storybook

Todo componente nuevo en **`src/app/components/`** lleva su `*.stories.ts` (documentación viva + catálogo visual). Los componentes de página (`src/app/pages/`) están exentos, y también el que **delega toda su vista** en otro componente ya catalogado — las cuatro condiciones de esa excepción, y su verificación, viven en [`coding-agent-policies.md`](coding-agent-policies.md) (Sección 2), que es su fuente. El `*.spec.ts` no se exime en ninguno de los dos casos.

### Convenciones (según las stories existentes)

- `title` en español bajo `Componentes V3/...` (p. ej. `'Componentes V3/Tag'`).
- **autodocs es global.** `.storybook/preview.js` exporta `tags = ['autodocs']`, así que **no** hace falta repetir `tags: ['autodocs']` por archivo (es redundante).
- `parameters.docs.description.component` con descripción en español (HTML, ver reglas abajo).
- `argTypes` para **cada `input()` público**, con `control`, `options`/`type` y `table` (`type` + `defaultValue`). Aplica también a inputs de tipo objeto complejo (p. ej. `story`, `collection`): aunque no se editen cómodamente en el panel, usar `control: { type: 'object' }` y documentar `table.type`/`table.defaultValue`.
- Una **story por estado/variante** (`Soft`, `Filled`, `Gray`, …) y opcionalmente un `Showcase` con todas las variantes en simultáneo. Cada story lleva su `docs.description.story` con el **comportamiento** y una línea **`<strong>Usos:</strong>`** que indica en qué páginas/componentes se usa la variante.
- Render con `argsToTemplate(args)` y el selector real del componente (`cuentoneta-...`).

```typescript
import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { TagComponent } from './tag.component';

const meta: Meta<TagComponent> = {
	component: TagComponent,
	title: 'Componentes V3/Tag',
	parameters: {
		docs: { description: { component: `<div><p>El <strong>TagComponent</strong> del Design System v3...</p></div>` } },
		layout: 'padded',
	},
	argTypes: {
		label: { control: { type: 'text' } },
		variant: {
			control: { type: 'inline-radio' },
			options: ['soft', 'filled', 'gray'],
			table: { defaultValue: { summary: 'soft' } },
		},
	},
};
export default meta;
type Story = StoryObj<TagComponent>;

export const Soft: Story = {
	render: (args) => ({ props: args, template: `<cuentoneta-tag ${argsToTemplate(args)} />` }),
	args: { label: 'Crónica', variant: 'soft' },
};
```

Para dependencias de DI usá los decoradores `moduleMetadata({ imports, providers })` (imports/iconos por story) o `applicationConfig({ providers })` (servicios globales: Router, etc.).

**Siempre** actualizá las stories cuando cambien inputs, estados visuales o la API pública del componente.

### Documentación de la descripción (`description`)

`docs.description.component` y `docs.description.story` se renderizan como **Markdown** en los autodocs. Reglas:

- **Una sola línea por descripción.** El render de Markdown trata cualquier línea con indentación (tab / ≥ 4 espacios) como bloque de código, así que un HTML multilínea indentado se muestra dentro de un recuadro de código. Escribí el HTML de la descripción en una sola línea (sin saltos ni indentación interna).
- **Negrita para nombres de componentes.** El nombre del componente documentado y el de cualquier otro componente mencionado van en `<strong>…</strong>`.
- **Enlace navegable a otros componentes.** Cuando la descripción menciona otro componente documentado, su nombre debe ser un enlace que navegue a la story de ese componente. Como la doc se renderiza dentro de `iframe.html`, usá un enlace relativo a la raíz del Storybook (robusto ante subpaths de deploy) con `target="_top"`:

  ```html
  <a href="./?path=/docs/<kind-id>--docs" target="_top"><strong>LiteraryWorkCardTeaser</strong></a>
  ```

  El `<kind-id>` se deriva del `title` (minúsculas; espacios y `/` → `-`): `Componentes V3/LiteraryWorkCardTeaser` → `componentes-v3-literaryworkcardteaser`. El sufijo `--docs` apunta a la página de autodocs.

### Estado de carga (skeleton) → story intercambiable (obligatoria)

Si el componente **renderiza un skeleton en su propia plantilla**, su story debe exponer ese estado de forma **intercambiable** — la obligación es de quien lo dibuja, no de quien solo pasa un `loading` hacia abajo: un control booleano (`loading` / "Cargando") que alterna entre el estado real y el skeleton **en el mismo slot**, para poder evaluar la transición y la alineación 1:1 (sobre todo el **alto**, que es el que produce jitter de layout). Es obligatoria para todo componente con estado de carga; su omisión es bloqueante en review (ver [`coding-agent-policies.md`](coding-agent-policies.md)).

```typescript
// Un control booleano `loading` alterna real↔skeleton en el mismo slot.
export const Estados: StoryObj<MiComponente & { loading: boolean }> = {
	decorators: [moduleMetadata({ imports: [MiComponenteSkeleton] })],
	argTypes: { loading: { control: 'boolean', name: 'Cargando' } },
	render: (args) => ({
		props: args,
		template: `
			@if (loading) {
				<cuentoneta-mi-componente-skeleton />
			} @else {
				<cuentoneta-mi-componente [data]="data" />
			}
		`,
	}),
	args: { loading: true /* …datos del estado real */ },
};
```

Si el componente **renderiza su propio skeleton** según un input (p. ej. cuando `data` está ausente), alcanza con una sola instancia y se evita el `@if`: `[data]="loading ? undefined : data"`.

---

## Checklist por tipo de cambio

- **Componente nuevo/modificado en `src/app/components/`** → spec con ATL (comportamiento) **siempre**; `*.stories.ts` salvo delegación total.
- **Componente que renderiza un skeleton en su plantilla** → además, story con **estado intercambiable** (switch real↔skeleton en el mismo slot).
- **Service/repository de backend** → spec funcional; si necesita aislar el repository, module mocking con el bloque `eslint-disable` + nota #1503.
- **Mocks/timers** → siempre desde `@test-utils`; `clearAllMocks()` en `beforeEach`.
- **Componente que usa `IntersectionObserver`** → `installIntersectionObserverStub()` en `beforeEach`; simular overflow con `markOutsideViewport` / `markInsideViewport`.
- **Lógica Node pura de `cms/`** → spec propio con Vitest standalone (`pnpm sanity:test`); dobles escritos a mano (`Spy*`/`Stub*`/`Fake*`), sin `@test-utils`.
