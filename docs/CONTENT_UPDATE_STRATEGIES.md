<div align="center" width="100%">
    <h1>La Cuentoneta</h1>
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
        <img width="33%" alt="La Cuentoneta" src="https://github.com/rolivencia/cuentoneta/assets/32349705/b0ea0659-3c9d-4c4f-9d14-ab60d50dd832">
    </picture>
</div>

---

# Estrategias de Actualización de Contenido

Este documento describe las estrategias, procesos y herramientas utilizadas para la actualización automática de contenido en La Cuentoneta mediante trabajos programados (cron jobs) y generación automática de configuraciones.

---

## Introducción

La Cuentoneta implementa estrategias para mantener el contenido de la plataforma actualizado de forma automática, facilitando la gestión manual y automatizándola en partes. Actualmente estas estrategias incluyen:

- **Contenido rotativo** - Gestión centralizada de contenido dinámico (cron job)
- **Generación automática de configuraciones de landing pages** (cron job)

### El Patrón de Contenido Rotativo

La aplicación implementa un patrón centralizado llamado **`rotatingContent`** que actúa como **documento singleton** en Sanity para almacenar referencias a contenido que cambia regularmente o dinámicamente. Este patrón está diseñado para ser **extensible**, permitiendo agregar nuevos tipos de contenido rotativo sin modificar la estructura existente.

Actualmente, este documento almacena:

- **Lo más leído** - Ranking actualizado automáticamente de manera diaria. Vive en `mostReadLiteraryWorks`, que referencia obras (`literaryWork`); `mostRead`, que referenciaba historias, quedó en baja — el schema todavía lo declara, pero ninguna query ya lo proyecta ni el cron lo escribe.

Las funcionalidades relacionadas a contenido rotativo están y deben de ser implementadas a nivel de servidor, a fin de ejecutar procedimientos en intervalos de tiempo dados, regulares o esporádicos, para garantizar que el contenido mostrado en la plataforma esté actualizado y sea coherente con la hoja de ruta de contenido del proyecto.

---

## Contenido Rotativo: Historias Más Leídas

### Descripción General

Las **historias más leídas** son un ejemplo de contenido dentro del patrón de **contenido rotativo**. Actualmente, mediante el uso de la [Data Export API de Microsoft Clarity](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-data-export-api), el sistema mantiene un registro de las historias más leídas por los usuarios de La Cuentoneta, tomando una referencia de las historias más leídas en los últimos tres días.

De manera diaria se ejecuta un cron job, definido en `vercel.json` para su ejecución a las 03:30 am (GMT -3), que se encarga, partiendo de esas listas, de alojar en el documento singleton `rotatingContent` las referencias correspondientes.

Escribe en `mostReadLiteraryWorks`, con referencias a documentos `literaryWork`. La ruta servida hoy es `/literary-work/:slug`, pero el conteo de páginas populares de Clarity lee **todos los prefijos de URL que la obra haya tenido**: la métrica registra la URL efectivamente visitada, y una redirección no recupera lo medido bajo un prefijo anterior — la ventana que se consulta puede alcanzar días en los que la obra respondía bajo `/story/:slug` o `/read/:slug`, y quedarse solo con el prefijo vigente subestimaría el ranking mientras ese tráfico histórico siga dentro de la ventana. Los slugs resultantes se deduplican —la obra migrada conserva el slug de su historia de origen, así que el mismo slug puede llegar por más de un camino— y se resuelven a `_id` de `literaryWork` antes de escribir las referencias.

### Ubicación en el Código

- **Consultas GROQ**: `src/api/_queries/content.query.ts` - `rotatingContentQuery` (lectura del documento singleton) y `src/api/_queries/literary-work.query.ts` - `literaryWorkTeasers`, cuyo filtro opcional por slugs resuelve el lote del ranking
- **Repositorio de acceso a datos**: `src/api/modules/content/content.repository.sanity.ts` - `SanityContentRepository.fetchRotatingContent()` y `updateMostReadLiteraryWorks(slugs)`, que resuelve los slugs y repone el orden del ranking antes de parchear
- **Servicio**: `src/api/modules/literary-work/literary-work.service.ts` - `updateMostReadLiteraryWorks()`, que deriva los slugs de Clarity y se los pasa al repositorio
- **Ruta**: `src/api/modules/literary-work/literary-work.controller.ts` - `GET /update-most-read`, declarada `no-store` porque el módulo sirve sus lecturas con caché de borde y una escritura servida desde el borde devolvería un 200 sin haber corrido

La resolución de slugs a identificadores vive **dentro de la escritura** y no en el puerto de obras: los slugs salen de una métrica externa, así que quien orquesta no tiene de dónde sacar un identificador, y pedírselo a otro repositorio para devolvérselo a éste haría que el caso de uso cruzara dos repositorios para escribir en uno. Los resuelve el listado de obras y no una consulta dedicada: el registro de filtro de ese listado declara que cada criterio nuevo entra como campo opcional, y una consulta que solo tradujera slugs a identificadores sería una segunda forma de preguntar lo mismo.

### Configuración en Sanity Studio

El documento singleton `rotatingContent` en Sanity almacena la información de contenido rotativo. **Estructura actual:**

```typescript
{
  _id: "rotatingContent",
  _type: "rotatingContent",
  mostReadLiteraryWorks: Array<LiteraryWorkReference>,  // Obras más leídas (vigente)
  mostRead: Array<StoryReference>                       // Obras más leídas (en baja)
}
```

> **Retiro en curso.** `mostRead` ya no lo lee `rotatingContentQuery` ni lo escribe el cron: el único productor y el único consumidor pasaron a `mostReadLiteraryWorks`. El campo se conserva en el schema porque el Studio y la aplicación no despliegan a la vez, y porque su baja definitiva —dar de baja el campo del schema y limpiar los documentos ya persistidos— es un trabajo aparte, con su propio issue.

### Estructura Extensible del Documento

El documento `rotatingContent` está diseñado para ser **extensible**. La estructura actual solo incluye lo más leído, pero puede extenderse con nuevos campos sin romper la funcionalidad existente.

**Ejemplos de campos que podrían agregarse en el futuro:**

```typescript
{
  _id: "rotatingContent",
  _type: "rotatingContent",
  mostReadLiteraryWorks: Array<LiteraryWorkReference>,  // Obras más leídas (vigente)

  // Potenciales campos futuros:
  // trending: Array<StoryReference>,       // Historias trending
  // featured: Array<ContentReference>,     // Contenido destacado
  // seasonal: Array<StoryReference>,       // Contenido estacional
  // byGenre: Record<string, Array<StoryReference>>,  // Recomendaciones por género
  // editorPicks: Array<StoryReference>,    // Selecciones del editor
}
```

### Frecuencia de Ejecución

El cron job que actualiza el contenido rotativo se ejecuta de manera diaria, durante la madrugada en horario GMT -3 (horario de Buenos Aires, Argentina).

---

## 2. Generación Automática de Configuraciones de Landing Pages

### Descripción General

Una **configuración de landing page** en La Cuentoneta es una configuración temática que agrupa contenido relevante para un período de tiempo, contable en semanas, y con un mínimo de una semana — siendo extensible a períodos múltiplos de una semana mediante la copia de este contenido.

El sistema genera automáticamente las configuraciones de landing pages para las próximas semanas a partir de la vigente mediante un cronjob. En caso de que no haya configuraciones de landing pages definidas para alguna de las próximas cuatro semanas en la plataforma el sistema se encarga de generarlas, utilizando como base la configuración válida más reciente **que no sea futura** (`config <= semana actual`), es decir, la semana vigente curada por los editores.

Este proceso garantiza que:

- Siempre haya landing pages disponibles para las próximas cuatro semanas, permitiendo una configuración planificada en múltiplos de semanas.
- Los editores de contenido solo necesiten actualizar la configuración de la semana vigente, modificándola completamente o en partes.
- Las nuevas semanas hereden automáticamente la estructura de la semana vigente, siendo las nuevas configuraciones creadas copiando esa configuración en el estado en el que se encuentra al momento de ejecutarse el cronjob.

### Estructura de una Landing Page

```typescript
{
  _id: "landing-page-2025-46",
  _type: "landingPage",
  config: "2025-46",        // Año - Número de semana
  slug: {
    _type: "slug",
    current: "2025-46"
  },
  campaigns: Array<CampaignReference>,               // Campañas a mostrar
  collections: Array<CollectionReference>,           // Colecciones con tarjetas (vigente)
  latestLiteraryWorks: Array<LiteraryWorkReference>, // Obras destacadas (vigente)
  cards: Array<StorylistReference>,                  // Tarjetas de contenido (en baja)
  latestReads: Array<StoryReference>,                // Historias destacadas (en baja)
  highlightedAuthors: Array<AuthorReference>         // Hasta 6 autores destacados
}
```

> **Convivencia de campos.** `collections` y `latestLiteraryWorks` reemplazan a `cards` y `latestReads`. La query que sirve la landing (`landingPageContentQuery`) ya solo proyecta los dos vigentes; `latestLandingPageReferencesQuery` —la que arma la copia semanal— sigue proyectando los cuatro, porque los campos en baja siguen siendo editables en el Studio hasta que se retiren, y dejar de copiarlos vaciaría la landing heredada para quien todavía los edite.

El tope de seis de `highlightedAuthors` lo impone el Studio sobre la edición, así que no gobierna lo ya guardado.

Como los otros tres, viaja en la copia semanal: si quedara afuera, los destacados se vaciarían en cada rotación sin emitir ningún error.

### Nomenclatura de Slugs

Las landing pages se identifican mediante slugs en formato **`YYYY-SS`**, con numeración de semana **ISO-8601**:

- **YYYY**: Año de cuatro dígitos (`getISOWeekYear`, el año ISO de la semana, no el calendario)
- **SS**: Número de semana ISO (01-53), con relleno cero a dos dígitos
- **Convención ISO-8601**: la semana empieza el **lunes** y la semana 1 es la que contiene el **primer jueves** del año (equivalente: la que contiene el 4 de enero). No es la convención local por defecto de `date-fns` (domingo = día 1, semana del 1° de enero).
- **Ejemplos**: `2025-46`, `2026-01`, `2024-52`

El año va primero para que el **orden lexicográfico del slug coincida con el orden cronológico** (`"2025-52" < "2026-01"`). Esto es lo que permite ordenar las semanas cronológicamente en Sanity Studio y acotar la query de la configuración base a `config <= semana actual`.

### Ubicación en el Código

- **Utilidad de dominio compartida (kernel)**: `src/utils/week-slug.utils.ts` - `buildWeekSlug(date)`, implementación **única** del slug semanal `YYYY-WW` (ISO-8601, ver [Nomenclatura de Slugs](#nomenclatura-de-slugs)). La consumen tanto `content.service.ts` como, desde el Studio de Sanity, `cms/utils/landing-page.ts` (resolución de la landing activa en Desk Structure) — evita mantener dos implementaciones de la misma fórmula en dos proyectos pnpm distintos.

- **Consultas GROQ**: `src/api/_queries/content.query.ts`
  - `landingPageContentQuery` - Obtiene contenido de una semana específica (proyecta `collections` y `latestLiteraryWorks`, ya no `cards` ni `latestReads`)
  - `landingPageListQuery` - Lista landing pages existentes
  - `latestLandingPageReferencesQuery` - Obtiene la configuración válida más reciente no futura (`config <= $currentSlug`, ordenada por `config desc`); proyecta los cuatro campos, vigentes y en baja, para la copia semanal

- **Repositorio de acceso a datos**: `src/api/modules/content/content.repository.ts` (puerto `ContentRepository`), implementado por `content.repository.sanity.ts` (`SanityContentRepository`) y doblado por `content.repository.mock.ts` (`InMemoryContentRepository`)
  - `fetchLandingPageContent(slug)` - Obtiene landing page por slug
  - `fetchLandingPagesList(slugs)` - Lista landing pages por slugs
  - `fetchLatestLandingPageReferences(currentSlug)` - Obtiene la configuración base (semana actual o anterior más reciente)
  - `createLandingPages(objects)` - Crea múltiples landing pages

- **Servicio de lógica de negocio**: `src/api/modules/content/content.service.ts`
  - `addNextWeeksLandingPageContent(weeksInTheFuture = 4)` - Función principal

- **Tests unitarios**: `src/utils/week-slug.utils.spec.ts` (casos borde del slug ISO-8601), `src/api/modules/content/content.service.spec.ts` y, del lado del Studio, `cms/utils/landing-page.spec.ts` (Vitest standalone de `cms/` — ver [`testing.md`](../.claude/references/testing.md))

### Proceso de Generación

La función `addNextWeeksLandingPageContent(weeksInTheFuture)` ejecuta el siguiente algoritmo:

```
1. Calcular fecha actual y slug de la semana actual (formato YYYY-WW vía getISOWeekYear + getISOWeek)
2. Generar slugs para las próximas N semanas (ej: weeksInTheFuture = 4)
3. Consultar Sanity para obtener landing pages existentes con esos slugs
4. Si TODAS las próximas N semanas ya existen → retornar vacío (sin cambios)
5. Si alguna no existe:
   a. Obtener la configuración base: la más reciente NO futura (config <= semana actual)
   b. Validar que la configuración existe (error si no)
   c. Filtrar las semanas que necesitan ser creadas
   d. Para cada semana faltante:
      - Copiar la configuración base
      - Actualizar el slug con la semana específica
      - Crear el documento en Sanity
   e. Ejecutar todas las creaciones en paralelo (Promise.all)
   f. Retornar array de documentos creados
```

### Frecuencia de Ejecución

La definición para la ejecución de este cronjob se encuentra en el archivo `vercel.json`:

- **Frecuencia**: Semanalmente
- **Día y hora**: Domingos a las 03:30 am (GMT -3)
- **Tolerancia**: Puede también ejecutarse de manera manual en cualquier momento antes de que se necesite

> **Interacción con la numeración ISO-8601 (#1751):** las semanas ISO empiezan el **lunes**, y el cron corre el **domingo** — el último día de la semana ISO en curso. Por eso, el domingo la home todavía sirve la semana que termina ese día, y recién el lunes rota a la siguiente. Esto es **continuo, sin huecos**: cada domingo el cron pre-genera las próximas 4 semanas (`semana_actual + 1 … + 4`), así que la semana que la home pedirá de lunes a sábado siempre existe. (La corrida del domingo genera desde la semana _siguiente_; la semana que la home pide ese mismo domingo fue creada por la corrida del domingo anterior.)

### Ejemplo de Ejecución

**Escenario**: Domingo 16 de noviembre de 2025, último día de la semana 46, a las 3:30 am (GMT -3). Se ejecuta el cronjob con el queryParam de "semanas hacia adelante" `weeksInTheFuture` predeterminado de 4.

```javascript
await addNextWeeksLandingPageContent(4);
```

**Semanas a procesar**: 47, 48, 49, 50 (2025)

**Resultado si todas existen**: `[]` (array vacío)

**Resultado si faltan semanas 49 y 50**:

Este flujo alternativo asume que fueron agregadas, por una ejecución manual llamando al endpoint o por una ejecución de cronjob previa, las configuraciones de landing pages para las semanas 47 y 48.

```javascript
[
  { _id: "landing-page-2025-49", config: "2025-49", slug: "2025-49", ... },
  { _id: "landing-page-2025-50", config: "2025-50", slug: "2025-50", ... }
]
```

### Manejo de Errores

La función lanza excepciones descriptivas en los siguientes casos:

| Condición                            | Error                                                          | Acción Recomendada                       |
| ------------------------------------ | -------------------------------------------------------------- | ---------------------------------------- |
| Lista de landing pages no se obtiene | `Could not retrieve the landing page configs`                  | Verificar conexión a Sanity              |
| Configuración base no existe         | `Latest landing page for the 'YYYY-SS' slug content not found` | Crear manualmente una configuración base |
| Error al crear documentos            | Error de Sanity API                                            | Reintentar o verificar permisos          |

---

## 3. Integración del Módulo de Contenido

### Arquitectura en Capas

El módulo de contenido sigue una arquitectura en capas para mantener la separación de responsabilidades. A diferencia de `story`/`storylist`, la ACL (traducción raw Sanity → dominio) no vive en `_utils/functions.ts`: queda dentro del repository, como métodos privados de `SanityContentRepository` — mismo patrón que `LiteraryWork` y `Collection` (ver [`sanity-acl.md`](../.claude/references/sanity-acl.md)).

```
┌─────────────────────────────────────┐
│   Controlador (API HTTP)            │
│  content.controller.ts              │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   Servicio (Lógica de Negocio)      │
│  content.service.ts                 │
│  - fetchLandingPageContent()        │
│  - fetchRotatingContent()           │
│  - addNextWeeksLandingPageContent() │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   Repositorio (puerto + adaptador)  │
│  content.repository.ts (puerto)     │
│  content.repository.sanity.ts       │
│  (ACL en privados)                  │
│  - fetchLandingPageContent()        │
│  - fetchRotatingContent()           │
│  - fetchLatestLandingPageReferences()│
│  - createLandingPages()             │
│  - updateMostReadLiteraryWorks()    │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│   Sanity CMS (Base de Datos)        │
│  client.fetch()                     │
│  client.create()                    │
└─────────────────────────────────────┘
```

### Ubicación de Archivos

```
src/api/modules/content/
├── content.controller.ts      # Endpoints HTTP
├── content.service.ts         # Lógica de negocio
├── content.service.spec.ts    # Tests unitarios
├── content.repository.ts      # Puerto (interfaz ContentRepository)
├── content.repository.sanity.ts # Adaptador Sanity (SanityContentRepository), ACL en privados
├── content.repository.mock.ts # Doble en memoria (InMemoryContentRepository)
└── content.errors.ts          # Errores tipados (LandingPageNotFoundError, MalformedLandingPageError, RotatingContentNotFoundError)

src/api/_queries/
└── content.query.ts           # Consultas GROQ

src/utils/
├── week-slug.utils.ts         # buildWeekSlug(date) — implementación única del slug YYYY-WW (kernel compartido, alias @utils)
└── week-slug.utils.spec.ts    # Tests unitarios (casos borde ISO-8601)

src/sanity/
└── types.ts                   # Tipos generados por Sanity (kernel compartido, alias @sanity-types)

cms/utils/
├── landing-page.ts            # Resolución de la landing activa para Desk Structure; consume buildWeekSlug()
└── landing-page.spec.ts       # Tests unitarios (Vitest standalone de cms/)
```

---

## 4. Workflow Típico

Todos los horarios están especificados en horario GMT -3 (Buenos Aires, Argentina) y en formato de 24 horas. Se considera al domingo como el "día 7 de la semana".

### Semana de Publicación Normal

1. **Domingo 03:30 (día 7, semana vigente)** - cron job genera landing pages para, como máximo, las próximas 4 semanas
2. **Lunes 00:00 (día 1, semana posterior)** - Se visualiza en la landing page el contenido configurado correspondiente a la nueva semana que acaba de comenzar
3. **Lunes - Viernes (días 2-6, de la ahora semana vigente)** - Editores actualizan contenido de la landing page para la próxima semana
4. **Sábado (día 6)** - Revisión final de cambios
   5**Domingo siguiente 03:30** - La Se repite el ciclo con la próxima semana como "actual"

### Actualización de Historias Más Leídas

1. **Diariamente 03:15** - cron job recopila métricas de visualización
2. **Cálculo automático** - Se ordena el ranking de obras
3. **Actualización** - Documento `rotatingContent` se sincroniza
4. **Visible en web** - Usuarios ven el ranking actualizado en su próximo acceso a la landing page de La Cuentoneta

---

## 5. Referencias y Enlaces

- [Sanity Documentation](https://www.sanity.io/docs)
- [GROQ Query Language](https://www.sanity.io/docs/groq)
- [Schema Sanity](./SANITY.md)
- [Modelo de Dominio](./DOMAIN_MODEL.md)
- [Guía de Desarrollo](./DEVELOPMENT_GUIDE.md)

---

## 6. Preguntas Frecuentes

### ¿Qué pasa si no se ejecuta el cron job?

Las landing pages existentes seguirán funcionando. Los usuarios no verán contenido "roto", pero sí verán landing pages más antiguas para las semanas futuras hasta que se ejecute el cron job.

### ¿Puedo crear landing pages manualmente en Sanity Studio?

No, la creación está bloqueada para evitar inconsistencias. Sin embargo, puedes:

- Editar landing pages existentes
- Actualizar la configuración base (document de referencias)
- Contactar a un administrador si necesitas crear una manualmente en casos especiales

### ¿Qué pasa si la configuración base es muy antigua?

La función siempre utiliza la configuración válida más reciente que no sea futura (`config <= semana actual`), es decir, la semana vigente. Si necesitas cambiar la estructura para todas las futuras semanas, actualiza la landing page de la semana actual y ejecuta el cron job nuevamente.

### ¿Puedo generar landing pages para más de 4 semanas?

Sí, la función acepta un parámetro `weeksInTheFuture`:

```typescript
await addNextWeeksLandingPageContent(8); // Genera 8 semanas adelante
```

Sin embargo, se recomienda mantener entre 4-6 semanas para evitar data obsoleta.

### ¿Cómo agrego un nuevo tipo de contenido rotativo?

El documento `rotatingContent` está diseñado para ser extensible. Para agregar un nuevo tipo de contenido rotativo (ej: contenido trending, contenido destacado, etc.):

1. **Actualizar el schema** en `cms/schemas/rotatingContent.ts`
   - Agregar el nuevo campo con su tipo (array, referencia, etc.)

2. **Regenerar tipos**:

   ```bash
   pnpm sanity typegen generate
   ```

3. **Crear la query GROQ** en `src/api/_queries/content.query.ts` si es necesario

4. **Implementar el cron job** para actualizar el campo
   - Crear una función similar a la de "historias más leídas"

5. **Exponer en el servicio** (`src/api/modules/content/content.service.ts`)
   - Agregar una función para obtener el nuevo contenido

El patrón centralizado evita la proliferación de documentos y consultas, manteniendo toda la gestión de contenido dinámico en un único lugar.

### ¿Qué diferencia hay entre `rotatingContent` y las `landingPages`?

- **`rotatingContent`**: Documento **singleton** que almacena referencias a contenido **dinámico/cambiante** (historias más leídas, trending, etc.). Se actualiza automáticamente mediante cron jobs.

- **`landingPages`**: Documentos **específicos por semana** que agrupan contenido curado para un período (campaignas, tarjetas, historias destacadas). Se generan automáticamente basándose en una configuración base, pero el contenido en sí es más estático.

Ambos trabajan juntos: las landing pages pueden incluir referencias al contenido rotativo.

---
