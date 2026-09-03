# `add-a-la-deriva-audio-narration`

Agrega a la obra **"A la deriva"** su narración en audio —el episodio real del podcast _Armario de Cuentos_ en Spotify— como segundo recurso multimedia.

## Por qué

Ninguna obra de ningún dataset tenía dos formatos multimedia de tipos distintos: el selector de formatos de la página de lectura nunca tuvo datos reales que lo ejerciten. Los tests de extremo a extremo afirman el cambio de formato sobre esta obra, y su guarda de curaduría sale roja —a propósito, nombrando qué falta— en todo dataset donde esta migración no haya corrido.

El recurso es **contenido editorial genuino** (una narración real del cuento correcto), así que vale igual para `production`: no es un fixture que haya que limpiar después.

## Semántica

- **Idempotente por URL, no por clave:** el dataset ya curado a mano lleva el mismo episodio, y un recurso cargado desde el Studio tendría clave propia; la identidad real del episodio es su URL, y duplicarlo mostraría dos veces la misma narración en el selector.
- **Recorre también los borradores:** publicar uno creado antes de la corrida reemplaza al documento publicado por su contenido, y dejarlo afuera perdería el recurso en esa publicación.
- Sólo toca la obra `a-la-deriva`; el filtro se revalida sobre el documento.

## Comandos

Desde `cms/`. El destino va siempre explícito: `--project` y `--dataset` son **inseparables**. El identificador de proyecto se resuelve del entorno, nunca se escribe literal.

```bash
# Dry-run (es el comportamiento por defecto)
pnpm exec sanity migration run add-a-la-deriva-audio-narration \
  --project "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" \
  --dataset <destino>

# Aplicar. `--no-confirm` hace falta cuando no hay TTY.
pnpm exec sanity migration run add-a-la-deriva-audio-narration \
  --project "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" \
  --dataset <destino> --no-dry-run --no-confirm
```

Destinos pendientes: **`staging`** (destraba el gate `e2e` de CI) y **`production`** (editorial). En `development` ya está curado a mano y la corrida es un no-op, que también sirve de verificación de la idempotencia.

## Verificación posterior

```groq
count(array::unique(*[_type == 'literaryWork' && slug.current == 'a-la-deriva'][0].mediaSources[]._type))
```

Debe dar **2 o más**. Es la misma propiedad —tipos distintos, no cantidad— que exige la guarda de los e2e.
