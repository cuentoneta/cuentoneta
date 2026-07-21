<!-- Fuente: CLAUDE.md | Última actualización: 2026-06-15 -->

# Principios SOLID

Diseñá clases, módulos y sus relaciones para que sean flexibles, mantenibles y resilientes al cambio. En cuentoneta estos principios guían tanto los componentes Angular (servicios + signals) como las capas del backend (controller → service → repository) y los mappers del ACL.

> El código y los identificadores van **siempre en inglés**; los comentarios pueden ir en español.

## S — Principio de Responsabilidad Única (SRP)

**Una clase debe tener una, y solo una, razón para cambiar.**

- Cada clase o módulo es dueño de una sola parte de la funcionalidad.
- "Razón para cambiar" = un actor o stakeholder cuyas necesidades podrían motivar modificaciones.
- Si para describir lo que hace una clase necesitás un "y", considerá dividirla.

**Síntomas de violación:** clases enormes, métodos no relacionados agrupados, cambios que se propagan a funcionalidad ajena.

**Guía:**

- Separá persistencia, validación, formateo y lógica de negocio en clases distintas. En el backend esto ya está reflejado en las capas: el `repository` (`fetch*()`) solo accede a datos, el `service` (`get*()`) aplica lógica de negocio y mapea al dominio, y el `controller` solo arma rutas y valida.
- Preferí muchas clases chicas y enfocadas antes que pocas grandes y multipropósito.

```typescript
// ✅ Responsabilidades separadas: el repository solo trae datos crudos de Sanity,
// el service mapea al dominio vía el ACL.
async function fetchStoryBySlug(slug: string) {
	return client.fetch(storyBySlugQuery, { slug }); // resultado crudo de Sanity
}

async function getStoryBySlug(slug: string): Promise<Story> {
	const raw = await fetchStoryBySlug(slug);
	return mapStory(raw); // mapper / ACL
}

// ❌ Una sola función que consulta, mapea, valida y formatea para la UI:
// demasiadas razones para cambiar.
```

---

## O — Principio Abierto/Cerrado (OCP)

**Las entidades de software deben estar abiertas a la extensión pero cerradas a la modificación.**

- Agregá comportamiento nuevo sin tocar el código existente.
- Se logra mediante abstracción: dependé de interfaces, no de implementaciones concretas.
- Funcionalidad nueva = clases nuevas que implementan interfaces existentes.

**Síntomas de violación:** agregar `if/else` o `switch` cada vez que aparece un tipo nuevo.

**Guía:**

- Usá polimorfismo y composición estratégicamente como puntos de extensión.
- Favorecé la composición sobre la herencia al extender comportamiento.

```typescript
// ❌ Cerrado a la extensión: cada nuevo tipo de recurso obliga a tocar este switch.
function renderResource(resource: Resource) {
	switch (resource.mediaType) {
		case 'audio':
			return renderAudio(resource);
		case 'video':
			return renderVideo(resource);
		// ...y a editar esta función cada vez que se agrega un mediaType
	}
}

// ✅ Abierto a la extensión vía abstracción: un nuevo renderer implementa la interfaz
// sin modificar el código que la consume.
interface ResourceRenderer {
	canRender(resource: Resource): boolean;
	render(resource: Resource): string;
}
```

---

## L — Principio de Sustitución de Liskov (LSP)

**Los subtipos deben poder sustituir a sus tipos base sin alterar la correctitud del programa.**

- Si S es subtipo de T, los objetos de tipo T pueden reemplazarse por objetos de tipo S.
- Las clases derivadas deben respetar los contratos de la base (precondiciones, postcondiciones, invariantes).

**Síntomas de violación:** chequeos `instanceof`, condicionales por tipo en el código cliente.

**Guía:**

- No sobreescribas métodos de forma que viole las expectativas de la clase base.
- Si una subclase no puede soportar plenamente un método de la base, la jerarquía está mal.
- En cuentoneta esto aplica a las implementaciones intercambiables de un repositorio: un `SanityStoryRepository` y un `InMemoryStoryRepository` (usado en tests) deben honrar el mismo contrato — mismas garantías de retorno y de error — para ser sustituibles sin que el `service` lo note.

---

## I — Principio de Segregación de Interfaces (ISP)

**Los clientes no deberían verse forzados a depender de interfaces que no usan.**

- Preferí muchas interfaces chicas y específicas antes que una grande y de propósito general.
- Cada interfaz representa un conjunto cohesivo de comportamientos para un cliente específico.

**Síntomas de violación:** implementadores que lanzan errores de "no implementado", clases que implementan interfaces con métodos sin usar.

**Guía:**

- Diseñá las interfaces desde la perspectiva del cliente.
- Interfaces de rol (`StoryReader`, `StoryListProvider`) antes que interfaces "cabezal" que lo abarcan todo.

```typescript
// ✅ Interfaces de rol segregadas: un consumidor que solo lista no depende de la lectura por slug.
interface StoryReader {
	getStoryBySlug(slug: string): Promise<Story>;
}

interface StoryListProvider {
	getStories(): Promise<Story[]>;
}

// ❌ Una interfaz monolítica que obliga a todo cliente a conocer lectura, listado,
// escritura, búsqueda, etc., aunque solo use una de esas operaciones.
```

---

## D — Principio de Inversión de Dependencias (DIP)

**Los módulos de alto nivel no deben depender de los de bajo nivel. Ambos deben depender de abstracciones.**

- Invertí las dependencias tradicionales: alto y bajo nivel dependen de interfaces.
- La política de alto nivel define las interfaces; los detalles de bajo nivel las implementan.

**Guía:**

- Inyectá dependencias en vez de instanciarlas directamente. En Angular, usá `inject()` (no inyección por constructor); en el backend, pasá las dependencias como parámetros en vez de importar clientes concretos ad-hoc.
- Definí las interfaces junto al código que las usa, no junto al que las implementa.
- Evitá referencias directas a clases concretas para dependencias volátiles (Sanity, servicios externos). El cliente de Sanity se importa desde `_helpers/sanity-connector`, nunca instanciando `client` en cada módulo.

```typescript
// ✅ El componente (alto nivel) depende de una abstracción inyectada, no de Sanity directo.
export class StoryComponent {
	private readonly stories = inject(StoryApi);
	readonly slug = input.required<string>();
	protected readonly story = toSignal(/* derivado del slug vía el service */);
}

// ❌ El componente conoce GROQ y el cliente de Sanity directamente: alto nivel
// acoplado a un detalle de bajo nivel.
```

---

## Relaciones entre los principios SOLID

| Principio | Habilita                                                                            |
| --------- | ----------------------------------------------------------------------------------- |
| SRP       | Facilita OCP — las clases enfocadas son más simples de extender                     |
| OCP       | Se apoya en DIP — las extensiones funcionan a través de abstracciones               |
| LSP       | Garantiza que OCP funcione — los subtipos sustituibles permiten polimorfismo seguro |
| ISP       | Sostiene SRP — las interfaces segregadas reflejan responsabilidades únicas          |
| DIP       | Habilita a todos — las abstracciones son el cimiento del diseño flexible            |

_Fuente: Robert C. Martin, "Clean Code" (2008)_
