# Generación de Imágenes OpenGraph

Este documento describe la implementación del sistema de generación dinámica de imágenes OpenGraph para La Cuentoneta.

## Tabla de Contenidos

- [Introducción](#introducción)
- [Arquitectura](#arquitectura)
- [Stack Tecnológico](#stack-tecnológico)
- [Endpoints](#endpoints)
- [Frontend: Metatags](#frontend-metatags)
- [Diseño de Imágenes](#diseño-de-imágenes)
- [Caché](#caché)
- [Performance](#performance)
- [Testing](#testing)
- [Validación](#validación)
- [Troubleshooting](#troubleshooting)

## Introducción

Las imágenes OpenGraph son imágenes que se muestran cuando se comparte un enlace en redes sociales. La Cuentoneta genera estas imágenes dinámicamente para cada:

- **Story** (cuento)
- **Storylist** (colección de cuentos)
- **Author** (autor)

**Característica principal**: El sistema detecta automáticamente la plataforma que realiza la solicitud (mediante User-Agent) y genera imágenes optimizadas con dimensiones específicas para cada plataforma:

- **WhatsApp**: 1200x630px (ratio 1.91:1)
- **X/Twitter**: 1200x675px (ratio 1.78:1)
- **Threads**: 1080x1080px (ratio 1:1 - cuadrado)
- **Instagram**: 1080x1080px (ratio 1:1 - cuadrado)
- **Discord**: 1200x630px (ratio 1.91:1)

Esto mejora significativamente la presentación del contenido en cada plataforma social.

## Arquitectura

```
┌─────────────┐
│  Frontend   │  (story.component.ts)
│  Component  │  setImage('/api/og/story/slug')
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Backend   │  og.controller.ts
│  Controller │  GET /api/og/:type/:slug
└──────┬──────┘
       │
       ├──► Platform Detection (User-Agent)
       │    ├─ WhatsApp → 1200x630
       │    ├─ X/Twitter → 1200x675
       │    ├─ Threads → 1080x1080
       │    ├─ Instagram → 1080x1080
       │    └─ Discord → 1200x630
       │
       ├──► Cache Check (type-slug-platform)
       │    ├─ Hit: Return cached PNG
       │    └─ Miss: Generate new image
       │
       ├──► Service (getStoryBySlug)
       │
       ├──► Template (HTML markup with adaptive dimensions)
       │
       ├──► Satori (HTML → SVG)
       │
       ├──► Resvg (SVG → PNG)
       │
       ├──► Cache Save (filesystem)
       │
       └──► Response (image/png + cache headers + platform info)
```

## Stack Tecnológico

### Backend

- **Hono**: Framework web para el API
- **Satori**: Conversión de HTML/JSX a SVG
- **@resvg/resvg-js**: Conversión de SVG a PNG
- **Node.js fs**: Sistema de archivos para caché
- **Zod**: Validación de parámetros

### Frontend

- **Angular**: Framework principal
- **Meta Service**: Gestión de metatags
- **MetaTagsDirective**: Directiva personalizada para metatags

### Tipografía

- **Inter Medium**: Fuente utilizada en las imágenes OG
- Ubicación: `src/api/_utils/Inter-Medium.ttf`

## Detección de Plataforma

El sistema detecta automáticamente la plataforma que solicita la imagen OpenGraph analizando el header `User-Agent` de la request.

### Plataformas Soportadas

| Plataforma | User-Agent contiene | Dimensiones | Ratio | Layout |
|------------|-------------------|-------------|-------|--------|
| WhatsApp | `whatsapp` | 1200x630 | 1.91:1 | Rectangular |
| X/Twitter | `twitterbot`, `twitter` | 1200x675 | 1.78:1 | Rectangular |
| Threads | `threads` | 1080x1080 | 1:1 | Cuadrado |
| Instagram | `instagram` | 1080x1080 | 1:1 | Cuadrado |
| Discord | `discord` | 1200x630 | 1.91:1 | Rectangular |
| Default | (otros) | 1200x630 | 1.91:1 | Rectangular |

### Función de Detección

```typescript
function detectPlatform(c: Context): Platform {
  const userAgent = c.req.header('user-agent')?.toLowerCase() || '';

  if (userAgent.includes('whatsapp')) return 'whatsapp';
  if (userAgent.includes('twitterbot') || userAgent.includes('twitter')) return 'twitter';
  if (userAgent.includes('threads')) return 'threads';
  if (userAgent.includes('instagram')) return 'instagram';
  if (userAgent.includes('discord')) return 'discord';

  return 'default';
}
```

### Dimensiones por Plataforma

```typescript
const PLATFORM_DIMENSIONS: Record<Platform, ImageDimensions> = {
  whatsapp: { width: 1200, height: 630, ratio: 1.91 },
  twitter: { width: 1200, height: 675, ratio: 1.78 },
  threads: { width: 1080, height: 1080, ratio: 1.0 },
  instagram: { width: 1080, height: 1080, ratio: 1.0 },
  discord: { width: 1200, height: 630, ratio: 1.91 },
  default: { width: 1200, height: 630, ratio: 1.91 },
};
```

### Layout Adaptativo

El sistema ajusta automáticamente el diseño basándose en el ratio de aspecto:

**Formatos rectangulares** (ratio > 1):
- Fuentes más grandes
- Más espacio entre elementos
- Layout horizontal optimizado

**Formatos cuadrados** (ratio = 1):
- Fuentes reducidas proporcionalmente
- Menos padding
- Layout más compacto
- Menos tags mostrados (2 en lugar de 3)

## Endpoints

### GET `/api/og/story/:slug`

Genera imagen OpenGraph para un cuento específico.

**Parámetros:**
- `slug` (string): Slug único del cuento

**Headers de Request:**
- `User-Agent`: Se analiza para detectar la plataforma (WhatsApp, X, Threads, Instagram, Discord)

**Respuesta:**
- Content-Type: `image/png`
- Cache-Control: `public, max-age=31536000, immutable`
- X-OG-Platform: Plataforma detectada (ej: `whatsapp`, `twitter`, `threads`)
- X-OG-Dimensions: Dimensiones generadas (ej: `1200x630`, `1080x1080`)
- Dimensiones: Variables según plataforma (ver sección Detección de Plataforma)

**Ejemplo:**
```bash
# Request desde WhatsApp
GET /api/og/story/manos
User-Agent: WhatsApp/2.x

# Response
Content-Type: image/png
X-OG-Platform: whatsapp
X-OG-Dimensions: 1200x630
```

**Contenido de la imagen:**
- Logo de La Cuentoneta
- Título del cuento
- Nombre del autor
- Bandera y país del autor
- Tiempo de lectura en minutos

### GET `/api/og/storylist/:slug`

Genera imagen OpenGraph para una colección de cuentos.

**Parámetros:**
- `slug` (string): Slug único de la storylist

**Headers de Request:**
- `User-Agent`: Se analiza para detectar la plataforma

**Respuesta:**
- Content-Type: `image/png`
- Cache-Control: `public, max-age=31536000, immutable`
- X-OG-Platform: Plataforma detectada
- X-OG-Dimensions: Dimensiones generadas
- Dimensiones: Variables según plataforma

**Ejemplo:**
```bash
GET /api/og/storylist/cuentos-de-otono
```

**Contenido de la imagen:**
- Logo de La Cuentoneta
- Título de la storylist
- Cantidad de historias
- Tags (hasta 3)

### GET `/api/og/author/:slug`

Genera imagen OpenGraph para un autor.

**Parámetros:**
- `slug` (string): Slug único del autor

**Headers de Request:**
- `User-Agent`: Se analiza para detectar la plataforma

**Respuesta:**
- Content-Type: `image/png`
- Cache-Control: `public, max-age=31536000, immutable`
- X-OG-Platform: Plataforma detectada
- X-OG-Dimensions: Dimensiones generadas
- Dimensiones: Variables según plataforma

**Ejemplo:**
```bash
GET /api/og/author/jorge-luis-borges
```

**Contenido de la imagen:**
- Logo de La Cuentoneta
- Nombre del autor
- Bandera y país
- Años de vida (si están disponibles)

## Frontend: Metatags

### MetaTagsDirective

Directiva ubicada en `src/app/directives/meta-tags.directive.ts` que gestiona todas las metatags de la aplicación.

#### Métodos principales

**`setImage(imageUrl: string)`**

Configura todas las metatags relacionadas con imágenes OpenGraph:
- `og:image`: URL de la imagen
- `og:image:width`: 1200
- `og:image:height`: 630
- `twitter:card`: summary_large_image
- `twitter:image`: URL de la imagen

**`setType(type: 'website' | 'article' | 'profile')`**

Configura el tipo de contenido OpenGraph:
- `article`: Para stories (cuentos)
- `website`: Para storylists (colecciones)
- `profile`: Para authors (autores)

**`setUrl(url: string)`**

Configura la URL canónica del contenido:
- `og:url`: URL completa

### Uso en Componentes

#### StoryComponent

```typescript
private updateMetaTags(story: Story) {
  // Título optimizado
  this.metaTagsDirective.setTitle(`${story.title} - ${story.author.name}`);

  // Descripción personalizada
  const readingTime = story.approximateReadingTime;
  const nationality = story.author.nationality.country;
  this.metaTagsDirective.setDescription(
    `Leé "${story.title}", un cuento de ${story.author.name} (${nationality}). ${readingTime} ${readingTime === 1 ? 'minuto' : 'minutos'} de lectura. Literatura breve y gratuita en La Cuentoneta.`
  );

  // Imagen OG dinámica
  const ogImageUrl = `${environment.website}/api/og/story/${story.slug}`;
  this.metaTagsDirective.setImage(ogImageUrl);

  // Tipo de contenido
  this.metaTagsDirective.setType('article');

  // URL canónica
  const canonicalUrl = `${environment.website}/${AppRoutes.Story}/${story.slug}`;
  this.metaTagsDirective.setUrl(canonicalUrl);
}
```

#### StorylistComponent

```typescript
private updateMetaTags(storylist: Storylist) {
  const storyCount = storylist.count;
  const tagNames = storylist.tags.slice(0, 3).map(t => t.name).join(', ');
  const tagText = tagNames ? ` Temáticas: ${tagNames}.` : '';

  this.metaTagsDirective.setDescription(
    `Explorá ${storyCount} ${storyCount === 1 ? 'historia' : 'historias'} seleccionadas en esta colección de La Cuentoneta.${tagText} Literatura breve curada para disfrutar.`
  );

  const ogImageUrl = `${environment.website}/api/og/storylist/${storylist.slug}`;
  this.metaTagsDirective.setImage(ogImageUrl);
  this.metaTagsDirective.setType('website');
}
```

#### AuthorComponent

```typescript
private updateMetaTags(author: Author) {
  const yearRange = author.bornOnYear
    ? `${author.bornOnYear}${author.diedOnYear ? `-${author.diedOnYear}` : ''}`
    : '';

  this.metaTagsDirective.setDescription(
    `Descubrí las obras de ${author.name}, ${author.nationality.country}${yearRange ? ` (${yearRange})` : ''}. Biografía, cuentos y recursos sobre este escritor en La Cuentoneta.`
  );

  const ogImageUrl = `${environment.website}/api/og/author/${author.slug}`;
  this.metaTagsDirective.setImage(ogImageUrl);
  this.metaTagsDirective.setType('profile');
}
```

## Diseño de Imágenes

### Dimensiones

El sistema genera imágenes con dimensiones específicas para cada plataforma:

**Formatos Rectangulares (Landscape):**
- **WhatsApp**: 1200x630px (ratio 1.91:1)
- **Discord**: 1200x630px (ratio 1.91:1)
- **X/Twitter**: 1200x675px (ratio 1.78:1)
- **Default**: 1200x630px (ratio 1.91:1) - Para Facebook, LinkedIn, etc.

**Formatos Cuadrados:**
- **Threads**: 1080x1080px (ratio 1:1)
- **Instagram**: 1080x1080px (ratio 1:1)

Cada plataforma recibe la imagen optimizada para su formato nativo, mejorando la presentación visual en cada contexto.

### Paleta de Colores

- **Fondo**: Gradiente linear de `#e17d6b` a `#d4665a` (135deg)
- **Texto primario**: `#ffffff` (blanco)
- **Texto secundario**: `rgba(255,255,255,0.9)` (blanco con 90% opacidad)
- **Tags/badges**: `rgba(255,255,255,0.2)` (fondo semitransparente)

### Tipografía

- **Familia**: Inter
- **Peso**: Medium (500)

**Tamaños para formatos rectangulares (WhatsApp, X, Discord, Default):**
- Logo: 28px
- Título principal: 64px (stories/storylists), 72px (authors)
- Subtítulo: 36px (stories), 32px (storylists/authors)
- Metadata: 24px
- Tags: 20px
- Padding: 60px

**Tamaños para formatos cuadrados (Threads, Instagram):**
- Logo: 24px
- Título principal: 52px (stories/storylists), 56px (authors)
- Subtítulo: 28px (stories), 26px (storylists/authors)
- Metadata: 20px
- Tags: 16px
- Padding: 40px

Los tamaños se ajustan automáticamente según el ratio de aspecto de la imagen generada.

### Layout

#### Story
```
┌────────────────────────────────────┐
│ [Logo] La Cuentoneta               │
│                                    │
│                                    │
│ [Título del cuento]                │
│ por [Nombre del Autor]             │
│                                    │
│                                    │
│ 🇦🇷 Argentina    📖 5 min          │
└────────────────────────────────────┘
```

#### Storylist
```
┌────────────────────────────────────┐
│ [Logo] La Cuentoneta               │
│                                    │
│                                    │
│ [Título de la Storylist]           │
│ Una colección de 12 historias      │
│                                    │
│                                    │
│ [Tag 1] [Tag 2] [Tag 3]           │
└────────────────────────────────────┘
```

#### Author
```
┌────────────────────────────────────┐
│ [Logo] La Cuentoneta               │
│                                    │
│                                    │
│ [Nombre del Autor]                 │
│ 🇦🇷 Argentina • 1899 - 1986        │
│                                    │
│                                    │
│                                    │
└────────────────────────────────────┘
```

## Caché

### Sistema de Caché en Filesystem

El sistema implementa un caché en el sistema de archivos para optimizar el rendimiento.

#### Ubicación

```
cache/og/
  ├── [hash1].png
  ├── [hash2].png
  └── [hash3].png
```

El directorio `cache/` está excluido del repositorio (`.gitignore`).

#### Generación de Claves

Las claves de caché se generan mediante MD5 hash **incluyendo la plataforma**:

```typescript
function getCacheKey(type: string, slug: string, platform: Platform): string {
  const hash = createHash('md5').update(`${type}-${slug}-${platform}`).digest('hex');
  return `${CACHE_DIR}/${hash}.png`;
}
```

**Ejemplos:**
- Story "manos" para WhatsApp: `cache/og/a1b2c3d4e5f6...png`
- Story "manos" para Threads: `cache/og/x9y8z7w6v5u4...png`
- Storylist "cuentos-de-otono" para Twitter: `cache/og/f6e5d4c3b2a1...png`

**Importante**: Cada combinación de tipo, slug y plataforma genera una imagen única. Esto permite que la misma story tenga diferentes versiones optimizadas para cada plataforma social.

#### Flujo de Caché

1. **Primera request**:
   - Genera imagen (300-500ms)
   - Guarda en filesystem
   - Retorna imagen con headers de caché

2. **Requests posteriores**:
   - Lee desde filesystem (~10ms)
   - Retorna imagen con headers de caché

3. **Headers HTTP**:
   ```
   Cache-Control: public, max-age=31536000, immutable
   ```
   - `public`: Cacheable por CDNs y browsers
   - `max-age=31536000`: 1 año
   - `immutable`: No revalidar

#### Limpieza de Caché

Para limpiar el caché manualmente:

```bash
pnpm clear-og-cache
```

Este comando ejecuta el script `scripts/clear-og-cache.ts` que elimina el directorio `cache/og/` completo.

**Cuándo limpiar el caché:**
- Después de cambios en el diseño de las imágenes
- Después de actualizar la fuente tipográfica
- Después de modificar el logo
- Después de cambiar los colores

## Performance

### Métricas

| Métrica | Primera generación | Con caché (filesystem) | Con caché (browser) |
|---------|-------------------|----------------------|-------------------|
| Tiempo de respuesta | 300-500ms | ~10ms | Instant |
| Tamaño de imagen | ~150KB | ~150KB | ~150KB |
| CPU usage | Alto | Bajo | N/A |

### Optimizaciones Implementadas

1. **Caché en filesystem**: Evita regenerar imágenes idénticas
2. **Headers de caché HTTP**: Permite caché en navegadores y CDNs
3. **Inmutabilidad**: Las URLs no cambian, las imágenes se pueden cachear indefinidamente
4. **Compresión PNG**: Resvg genera PNGs optimizados

### Recomendaciones

Para producción:

1. **CDN**: Configurar un CDN frente al endpoint `/api/og/*`
2. **Precalentamiento**: Pre-generar imágenes para contenido popular
3. **Monitoring**: Monitorear tiempos de generación y tamaño de caché

## Testing

### Tests Unitarios

#### MetaTagsDirective

Ubicación: `src/app/directives/meta-tags.directive.spec.ts`

Tests implementados:
- ✅ `setImage()` configura todas las metatags de imagen
- ✅ `setType()` configura og:type correctamente
- ✅ `setUrl()` configura og:url correctamente
- ✅ `removeImage()` elimina todas las metatags de imagen
- ✅ `removeType()` elimina og:type
- ✅ `removeUrl()` elimina og:url
- ✅ `ngOnDestroy()` limpia todas las metatags

#### Ejecutar Tests

```bash
# Todos los tests
pnpm test

# Solo tests de MetaTagsDirective
pnpm test meta-tags.directive

# Tests en modo watch
pnpm test:watch
```

### Testing Manual

#### Herramientas de Validación

1. **OpenGraph.xyz**
   - URL: https://www.opengraph.xyz/
   - Uso: Pegar URL completa de la página
   - Verifica: Todos los metatags OG y Twitter

2. **Facebook Sharing Debugger**
   - URL: https://developers.facebook.com/tools/debug/
   - Uso: Pegar URL y hacer clic en "Scrape Again"
   - Verifica: Preview de Facebook

3. **Twitter Card Validator**
   - URL: https://cards-dev.twitter.com/validator
   - Uso: Pegar URL
   - Verifica: Preview de Twitter/X

4. **LinkedIn Post Inspector**
   - URL: https://www.linkedin.com/post-inspector/
   - Uso: Pegar URL
   - Verifica: Preview de LinkedIn

#### Casos de Prueba

**Story - Título Largo**
```
URL: /story/un-cuento-con-titulo-muy-largo-que-debe-ajustarse-correctamente
Verificar: Texto no se corta, se ajusta al contenedor
```

**Storylist - Sin Tags**
```
URL: /storylist/coleccion-sin-tags
Verificar: Sección de tags no aparece, diseño se adapta
```

**Author - Sin Años**
```
URL: /author/autor-contemporaneo
Verificar: Solo muestra nacionalidad, no años de vida
```

**Author - Con Años Completos**
```
URL: /author/jorge-luis-borges
Verificar: Muestra "1899 - 1986" correctamente
```

#### Testing con Localtunnel

Para testing en herramientas externas durante desarrollo:

```bash
# Terminal 1: Iniciar servidor
pnpm dev

# Terminal 2: Exponer con localtunnel
npm install -g localtunnel
lt --port 4200 --subdomain cuentoneta-dev
# Output: https://cuentoneta-dev.loca.lt
```

Luego usar `https://cuentoneta-dev.loca.lt/story/manos` en las herramientas de validación.

#### Testing de Detección de Plataforma

Para verificar que la detección de plataforma funciona correctamente:

```bash
# Simular request de WhatsApp
curl -H "User-Agent: WhatsApp/2.23.20.0" \
  http://localhost:4200/api/og/story/manos \
  -I

# Verificar headers de respuesta
# X-OG-Platform: whatsapp
# X-OG-Dimensions: 1200x630

# Simular request de Threads
curl -H "User-Agent: Mozilla/5.0 (compatible; Threads)" \
  http://localhost:4200/api/og/story/manos \
  -I

# Verificar headers de respuesta
# X-OG-Platform: threads
# X-OG-Dimensions: 1080x1080

# Simular request de Twitter
curl -H "User-Agent: Twitterbot/1.0" \
  http://localhost:4200/api/og/story/manos \
  -I

# Verificar headers de respuesta
# X-OG-Platform: twitter
# X-OG-Dimensions: 1200x675
```

**Descargar imágenes para comparación visual:**

```bash
# Generar imagen para WhatsApp
curl -H "User-Agent: WhatsApp/2.0" \
  http://localhost:4200/api/og/story/manos \
  -o manos-whatsapp.png

# Generar imagen para Threads
curl -H "User-Agent: Threads" \
  http://localhost:4200/api/og/story/manos \
  -o manos-threads.png

# Comparar visualmente ambas imágenes
```

## Validación

### Checklist de Validación

Antes de considerar la implementación completa, verificar:

#### Funcional
- [ ] Imágenes OG generadas para stories
- [ ] Imágenes OG generadas para storylists
- [ ] Imágenes OG generadas para authors
- [ ] Detección de plataforma funcionando correctamente
- [ ] Dimensiones correctas por plataforma (1200x630, 1200x675, 1080x1080)
- [ ] Layout adaptativo para formatos cuadrados y rectangulares
- [ ] Formato PNG correcto
- [ ] Caché funcionando (filesystem) con plataforma incluida
- [ ] Headers de caché configurados
- [ ] Headers de debug (X-OG-Platform, X-OG-Dimensions) presentes

#### Técnico
- [ ] Tests unitarios pasando
- [ ] TypeScript sin errores
- [ ] Linter pasando
- [ ] Performance < 500ms primera generación
- [ ] Tamaño de imagen < 200KB

#### Validación Externa
- [ ] Facebook Debugger muestra preview correcto
- [ ] Twitter Card Validator muestra `summary_large_image`
- [ ] LinkedIn Post Inspector muestra imagen correcta
- [ ] OpenGraph.xyz valida todas las metatags

#### UX/Design
- [ ] Logo visible y legible
- [ ] Textos legibles con buen contraste
- [ ] Diseño coherente con branding
- [ ] Información relevante destacada

#### Documentación
- [ ] README actualizado
- [ ] CONTRIBUTING.md incluye sección OG
- [ ] Código comentado (JSDoc)
- [ ] Este documento completo

## Troubleshooting

### Problemas Comunes

#### Las imágenes no se generan

**Síntoma**: Error 500 o timeout en `/api/og/*`

**Posibles causas:**
1. Fuente Inter-Medium.ttf no encontrada
2. Slug inválido (no existe en la base de datos)
3. Errores de conversión SVG→PNG

**Solución:**
```bash
# Verificar que existe la fuente
ls src/api/_utils/Inter-Medium.ttf

# Ver logs del servidor
pnpm dev

# Probar endpoint directamente
curl http://localhost:4200/api/og/story/manos -o test.png
```

#### Las imágenes están en blanco

**Síntoma**: La imagen se genera pero está vacía o en blanco

**Posibles causas:**
1. Errores en el markup HTML
2. Estilos CSS incompatibles con Satori
3. Fuente no cargada correctamente

**Solución:**
```typescript
// Verificar el markup en og.controller.ts
console.log(markup); // Antes de pasar a satori
```

#### Caché no funciona

**Síntoma**: Las imágenes se regeneran en cada request

**Posibles causas:**
1. Directorio `cache/og/` no se crea
2. Permisos de escritura insuficientes
3. Errores en la lógica de caché

**Solución:**
```bash
# Verificar permisos
ls -la cache/og/

# Crear directorio manualmente si no existe
mkdir -p cache/og

# Verificar que se están guardando archivos
ls -lh cache/og/
```

#### Texto se corta en la imagen

**Síntoma**: Títulos largos o descripciones se cortan

**Solución:**
```typescript
// Ajustar tamaño de fuente o agregar `max-width`
<h1 style="font-size: 64px; max-width: 90%; line-height: 1.2;">
  ${story.title}
</h1>
```

#### Errores en validadores externos

**Síntoma**: Facebook Debugger o Twitter Validator muestran errores

**Posibles causas:**
1. Headers HTTP incorrectos
2. URL no accesible públicamente
3. Tamaño de imagen excesivo

**Solución:**
```bash
# Verificar headers
curl -I http://localhost:4200/api/og/story/manos

# Debe incluir:
# Content-Type: image/png
# Cache-Control: public, max-age=31536000, immutable
```

#### Plataforma no detectada correctamente

**Síntoma**: Las imágenes siempre se generan con dimensiones default (1200x630)

**Posibles causas:**
1. User-Agent no incluye identificadores esperados
2. La lógica de detección no cubre el caso
3. La plataforma usa un User-Agent no estándar

**Solución:**
```bash
# Verificar el User-Agent que está llegando
# Agregar logs temporales en og.controller.ts:
console.log('User-Agent:', c.req.header('user-agent'));
console.log('Platform detectada:', platform);

# Probar directamente con curl
curl -H "User-Agent: tu-user-agent-aqui" \
  http://localhost:4200/api/og/story/manos \
  -I | grep X-OG-Platform

# Si la plataforma no se detecta, actualizar la función detectPlatform()
```

#### Imágenes cuadradas se ven mal

**Síntoma**: En formatos cuadrados (Threads/Instagram) el texto se corta o se ve desbalanceado

**Posibles causas:**
1. Títulos muy largos
2. Ajustes de tamaño de fuente insuficientes
3. Padding inadecuado

**Solución:**
```typescript
// Ajustar tamaños en generateStoryMarkup, generateStorylistMarkup, etc.
const titleSize = isSquare ? '48px' : '64px'; // Reducir más si es necesario
const padding = isSquare ? '30px' : '60px'; // Ajustar espaciado
```

#### Caché retorna imagen de plataforma incorrecta

**Síntoma**: WhatsApp muestra imagen cuadrada o viceversa

**Posibles causas:**
1. Caché no incluye plataforma en la key
2. Caché corrupto de versión anterior
3. CDN cacheando sin considerar User-Agent

**Solución:**
```bash
# Limpiar caché completamente
pnpm clear-og-cache

# Verificar que la función getCacheKey incluya platform
# En og.controller.ts debe ser:
# createHash('md5').update(`${type}-${slug}-${platform}`)

# Si usas CDN, configurar Vary header:
# Vary: User-Agent
```

### Logs y Debugging

Para debugging detallado:

```typescript
// En og.controller.ts, agregar logs:
console.log('📱 User-Agent:', c.req.header('user-agent'));
console.log('🎯 Platform detectada:', platform);
console.log('📏 Dimensiones:', dimensions);
console.log('📸 Generando OG image para:', type, slug);
console.log('🎨 Markup HTML:', markup.substring(0, 200) + '...');
console.log('✅ Imagen generada, tamaño:', png.length, 'bytes');
```

**Headers de debug en respuesta:**

Los headers `X-OG-Platform` y `X-OG-Dimensions` están incluidos en todas las respuestas para facilitar debugging:

```bash
curl -I http://localhost:4200/api/og/story/manos

# Debe mostrar:
# X-OG-Platform: default
# X-OG-Dimensions: 1200x630
```

## Referencias

### Especificaciones

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Card Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/webmasters)

### Herramientas

- [Satori Documentation](https://github.com/vercel/satori)
- [@resvg/resvg-js](https://github.com/yisibl/resvg-js)
- [Hono Framework](https://hono.dev/)

### Artículos Relacionados

- [The Essential Meta Tags for Social Media](https://css-tricks.com/essential-meta-tags-social-media/)
- [How to Create Dynamic Open Graph Images](https://vercel.com/blog/introducing-vercel-og-image-generation-fast-dynamic-social-card-images)

---

**Última actualización**: 2026-01-05
**Versión**: 1.0.0
**Autor**: Claude (implementación inicial)
