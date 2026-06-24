# Testing — La Cuentoneta

> Referencia detallada de testing. La síntesis vive en [`CLAUDE.md` → Testing](../../CLAUDE.md); este archivo profundiza en patrones y ejemplos.
>
> **Idioma:** documentación en español; **código e identificadores en inglés**.

---

## Stack y configuración

| Aspecto          | Valor                                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------- |
| **Runner**       | **Vitest** (`pnpm test` / `pnpm test:watch`)                                             |
| **Entorno**      | `happy-dom`, Angular **zoneless** (sin `zone.js`)                                        |
| **Componentes**  | **Angular Testing Library** (`@testing-library/angular`) + `@testing-library/user-event` |
| **Mocks/timers** | Wrappers de **`@test-utils`** (`src/test-utils.ts`)                                      |
| **Compilación**  | `@analogjs/vite-plugin-angular` (JIT en tests)                                           |

Archivos clave:

- **`vitest.config.ts`** — `globals: true`, `environment: 'happy-dom'`, `setupFiles: ['src/test-setup.ts']`, `include: ['src/**/*.{test,spec}.ts']`. Inlina `@sanity` y bundles `fesm` para que Vite los transforme. Coverage solo en CI (`CI=true`/`COVERAGE=true`).
- **`src/test-setup.ts`** — inicializa el `TestBed` zoneless (Angular 21 corre zoneless por defecto cuando `zone.js` no está presente; no se llama a `provideZonelessChangeDetection()`). El `ErrorHandler` **relanza** cualquier error no manejado para que falle el test. Instala el stub global de `IntersectionObserver`.
- **`src/test-utils.ts`** — los wrappers obligatorios (ver abajo).

---

## Regla dura: nada de `vi.*` directo

ESLint (`viRestrictedSyntax` en `eslint.config.js`) **prohíbe** usar `vi.fn()`, `vi.spyOn()`, `vi.useFakeTimers()`, `vi.clearAllMocks()`, etc. directamente en los specs. **`src/test-utils.ts` es la única excepción** (es el wrapper que el resto del repo consume).

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

```typescript
import { fn } from '@test-utils';

const getStory = fn<[string], Promise<Story>>();
getStory.mockResolvedValue(storyMock);

await render(StoryComponent, {
	providers: [{ provide: StoryService, useValue: { getStory } }],
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

`happy-dom` no implementa `IntersectionObserver`. `src/test-setup.ts` instala un **stub global** (`src/app/testing/intersection-observer.stub.ts`) para que cualquier componente que use IO se pueda renderizar.

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

> Nota (#1494): el stub es temporal. El browser mode de Vitest provee un `IntersectionObserver` real, lo que permitiría testear con layout real en vez de simular el callback a mano.

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

## Storybook

Todo componente nuevo en **`src/app/components/`** lleva su `*.stories.ts` (documentación viva + catálogo visual). Los componentes de página (`src/app/pages/`) están exentos.

### Convenciones (según las stories existentes)

- `title` en español bajo `Componentes/...` (p. ej. `'Componentes/Tag'`).
- `parameters.docs.description.component` con descripción en español (markdown/HTML).
- `argTypes` para cada `input()` público, con `control`, `options` y `table.defaultValue`.
- Una **story por estado/variante** (`Soft`, `Filled`, `Gray`, …) y opcionalmente un `Showcase`.
- Render con `argsToTemplate(args)` y el selector real del componente (`cuentoneta-...`).

```typescript
import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { TagComponent } from './tag.component';

const meta: Meta<TagComponent> = {
	component: TagComponent,
	title: 'Componentes/Tag',
	parameters: {
		docs: { description: { component: `El **TagComponent** del Design System v3...` } },
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
  <a href="./?path=/docs/<kind-id>--docs" target="_top"><strong>StoryCardTeaserV3</strong></a>
  ```

  El `<kind-id>` se deriva del `title` (minúsculas; espacios y `/` → `-`): `Componentes V3/StoryCardTeaserV3` → `componentes-v3-storycardteaserv3`. El sufijo `--docs` apunta a la página de autodocs.

### Estado de carga (skeleton) → story intercambiable (obligatoria)

Si el componente tiene un **estado de carga** (renderiza un skeleton), su story debe exponer ese estado de forma **intercambiable**: un control booleano (`loading` / "Cargando") que alterna entre el estado real y el skeleton **en el mismo slot**, para poder evaluar la transición y la alineación 1:1 (sobre todo el **alto**, que es el que produce jitter de layout). Es obligatoria para todo componente con estado de carga; su omisión es bloqueante en review (ver [`coding-agent-policies.md`](coding-agent-policies.md)).

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

- **Componente nuevo/modificado en `src/app/components/`** → spec con ATL (comportamiento) **y** `*.stories.ts`.
- **Componente con estado de carga (skeleton)** → además, story con **estado intercambiable** (switch real↔skeleton en el mismo slot).
- **Service/repository de backend** → spec funcional; si necesita aislar el repository, module mocking con el bloque `eslint-disable` + nota #1503.
- **Mocks/timers** → siempre desde `@test-utils`; `clearAllMocks()` en `beforeEach`.
- **Componente que usa `IntersectionObserver`** → `installIntersectionObserverStub()` en `beforeEach`; simular overflow con `markOutsideViewport` / `markInsideViewport`.
