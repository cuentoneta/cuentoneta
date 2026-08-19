# Sanear los recursos sin URL de autores y obras

Un recurso web sin enlace no significa nada: la URL es su razón de ser. El schema lo declara con
`Rule.required()`, pero esa regla valida la **edición** en el Studio y no lo ya almacenado, así que
quedaron documentos —anteriores a la regla, o escritos por script— con el hueco abierto.

En el autor el efecto era grave: el constructor de la Persona de schema.org leía `url.length` sobre
un valor ausente, lanzaba, y como corre en una directiva declarada como `hostDirective` de la página,
la excepción se llevaba puesto el render entero. La ficha y todas las obras de ese autor salían con
`<main>` vacío en SSR. En la obra el mismo hueco solo produce un enlace sin destino.

Esta migración cierra el hueco en los **datos**. Que la aplicación resista el caso lo garantiza el
ACL, que descarta el recurso incompleto en la frontera: son dos defensas distintas y ninguna
reemplaza a la otra, porque la validación del Studio no alcanza a lo escrito por script.

## Censo

Medido contra `production`, perspectiva `published`:

| Tipo           | Documentos con un recurso sin `url` | Documentos con `resources` | Total |
| -------------- | ----------------------------------: | -------------------------: | ----: |
| `author`       |                              **17** |                        281 |   326 |
| `story`        |                             **100** |                        254 |   613 |
| `literaryWork` |                             **100** |                        254 |   617 |

Los 100 de `story` y los 100 de `literaryWork` son el mismo contenido en documentos **distintos**:
cada obra derivada lleva el id `lw-from-story-<uuid del cuento>` y copió el array `resources` con sus
`_key` idénticos. Saltear uno de los dos tipos dejaría el espejo desalineado.

## Disposición, por tipo

**`author` — completar, salvo un caso.** El recurso se titula "Artículo de \<Nombre\> en Wikipedia", y
cada artículo se verificó uno por uno contra la API de MediaWiki. Dieciséis existen y se enlazan; el
único que no tiene destino es `anonimo`, donde "Anónimo" redirige a _Seudonimato y anonimato_, un
artículo sobre el concepto y no sobre una persona. Ese recurso se borra.

Un autor que no figure en la tabla y tenga un recurso sin URL **aborta la corrida**. La alternativa
—saltearlo— dejaría que un caso nuevo pase en silencio por una migración que cree haberlo cubierto.

**`story` / `literaryWork` — borrar.** Los 200 son un caso homogéneo: el recurso se titula siempre
"Enlace a recurso original" y no nombra ningún destino averiguable, así que no hay nada que
completar. Acá no hay tabla —la regla borra por predicado, con lo cual un documento nuevo con el
mismo hueco queda cubierto por definición—, pero sí un guard: si el título no es el del lote, la
corrida **aborta**. Es la única operación destructiva de la migración, y su justificación se apoya en
un hecho del dato, así que el código lo verifica en vez de darlo por cierto.

**Dos URLs cargadas sin protocolo.** Un autor tiene dos perfiles guardados como `instagram.com/…` y
`youtube.com/…`, sin esquema. No entran en el hueco que motiva la migración —tienen valor— pero la
validación de forma que este cambio agrega al schema los rechazaría, y sanear a medias dejaría
documentos en rojo por otro motivo. La migración les antepone `https://`.

**Los `mailto:` se conservan.** Cinco autores tienen su dirección de contacto cargada como recurso.
Son contenido válido, así que la validación del schema admite ese esquema además de `http`/`https`.

## Borradores

La corrida recorre también los borradores, donde una fila de recurso a medio completar es el estado
normal apenas se agrega un ítem en el Studio. Un **autor en borrador** fuera de la tabla se saltea en
vez de abortar: detener la corrida por una edición en curso impediría sanear el contenido publicado,
que es lo que la migración viene a arreglar. El guard sigue vigente para todo lo publicado.

## Por qué la disposición se indexa por slug y no por `_key`

Los `_key` del censo salieron de `production`, y la migración corre en los tres datasets sin garantía
de que coincidan. El recorrido localiza el recurso incompleto **por predicado** y lee su `_key` del
documento; la tabla se indexa por `slug.current`. Los `_key` de abajo quedan solo como cruce de
verificación del dry-run.

| slug de autor       | `_key` del recurso en `production` |
| ------------------- | ---------------------------------- |
| algernon-blackwood  | `VEUjhZrri4M2SX1V33ljUjL5anwgG4VH` |
| ambrose-bierce      | `euVmNg2UAgSDSklIMlIzlS8ACuM0VbSe` |
| anonimo             | `hui5KatfYJHZ7Ff0VoM1M5fL3Jz7kaFL` |
| don-juan-manuel     | `OPdclWAGjK50uSETGnzy7FQzOONNTHhS` |
| eta-hoffmann        | `BxCiHvRrtSo0KEEGXMY8ChgQN2BZeY1F` |
| frida-kahlo         | `Iw3Tt0myjnrAWcbOd4g4Jo6FunKGql9a` |
| h-rider-haggard     | `gukTxVjBfZsXsO0AGegRQOqUETn72uK7` |
| jean-ray            | `P6uqqsPxjwWK7fB7WY4F9qBTTmWFg2jj` |
| khalil-gibran       | `SqUvLWdjHgmcrWCANgbEwFVSwFCyzHlf` |
| kurt-vonnegut       | `UFCn3omoc6EwNk7Vn8oQXG7myYMfEI7f` |
| leon-tolstoi        | `XOOUJmTjv7kzwWz7j7G4o2fIMo7D67Ey` |
| margaret-st-clair   | `Kf9wsVxFfzs8ZkWrHVnN2uO6ALz0tluE` |
| natalia-ginzburg    | `JNQexx7pKbMZyYTObTVP2gD6yiIXnhGH` |
| nathaniel-hawthorne | `LF4x3z3mBtSXc9PJ7AwglB2CNuXIajxa` |
| neil-gaiman         | `RgJICM6dXkX6mv6k6zSLvUtDABePLMR1` |
| selma-lagerlof      | `74syWKDhiP84WQ0lrov0sZ8xVeDAxtek` |
| the-monty-python    | `muYViD4uvID37VMXP7E4H7q2ILXypKGl` |

El título del recurso de `the-monty-python` dice "The Monty Python", pero el artículo existe como
_Monty Python_. La URL apunta al artículo real; corregir el título es trabajo editorial aparte.

## Cómo se corre

Dry-run por defecto, y **una corrida por dataset**: aplicarla en uno no la aplica a los otros.

```bash
pnpm exec sanity migration run sanitize-resources-without-url --project "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" --dataset development
pnpm exec sanity migration run sanitize-resources-without-url --project "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" --dataset development --no-dry-run
```

Repetir para `staging` y `production`. El dry-run se contrasta contra los `_key` de la tabla.

Es **independiente del código**: no renombra un campo ni cambia la forma de un valor, solo completa o
quita un ítem que el código ya sabe leer. Los dos órdenes respecto del despliegue son seguros, así
que conviene el que alivia antes — correr el saneamiento primero devuelve el cuerpo a las 37 páginas
sin esperar al deploy.

Lo que sí tiene orden obligatorio es la validación de forma de URL en el schema: va **después** de
sanear, o el Studio marca en rojo los 217 documentos antes de que se los pueda corregir.

Mientras `production` conserve el dato roto, la copia nocturna lo vuelve a plantar en los otros dos
datasets. Sanear `production` primero hace que converjan solos en la copia siguiente, pero el orden
de las copias no es una garantía: la migración se corre igual en cada uno.

## Verificación

Que la corrida reporte N mutaciones dice que **alcanzó** N documentos, no que escribió lo correcto.
Se verifica consultando el resultado:

```groq
count(*[_type in ["author","story","literaryWork"] && count(resources[!defined(url)]) > 0])
```

Debe dar `0`. Y el smoke de indexado sobre las páginas que el defecto vaciaba:

```bash
BASE_URL=https://www.cuentoneta.ar SEO_SMOKE_SLUGS=/author/neil-gaiman,/story/wakefield pnpm seo:smoke
```
