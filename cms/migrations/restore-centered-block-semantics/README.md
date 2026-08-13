# `restore-centered-block-semantics`

Reexpresa en Markdown semántico los pasajes de tres obras donde el Portable Text original usaba **alineación centrada** para cargar significado. Markdown no tiene alineación, así que la migración a obras dejó esos pasajes como prosa corriente.

No toca ningún otro documento ni ningún otro pasaje: la tabla de correcciones enumera los tres identificadores y ancla cada corrección en un texto exacto.

## Qué corrige, obra por obra

### _La liga de los pelirrojos_ — los dos avisos impresos

El relato transcribe dos carteles: el que convoca a la Liga y el que anuncia su disolución. En el original cada uno venía **enmarcado por filas de asteriscos centradas**, que no son un corte de escena sino el borde del papel. La migración a Markdown tradujo esas filas a reglas horizontales, junto con los cortes de escena reales del corpus, y dejó el encabezado en negrita.

Ambos pasan a ser **cita**, que es la construcción que Markdown tiene para "esto es un texto dentro de otro texto". Como la cita ya hace de marco, las dos reglas que lo rodeaban se van con ella.

> Esta obra no tiene cortes de escena propios: sus cuatro reglas eran los dos marcos. Aun así el motor solo consume **las dos reglas contiguas al ancla**, porque la construcción es indistinguible y otra obra sí podría tener ambas cosas.

### _Carta a Chichita_ — la firma

El original centraba la firma al pie de la carta. Pasa a **énfasis**, que la distingue del cuerpo sin inventar una estructura que la carta no tiene. El texto que la precede —"Un beso de tu"— ya declara qué es, así que la marca es tipográfica y no informativa.

### _Amor a lo lejos_ — el encabezado de parte pegado

No es una pérdida de centrado sino un defecto visible: el encabezado de la última parte quedó **sin separación** del texto que lo sigue, así que renderiza corrido, a diferencia de las tres partes anteriores. En el origen los dos fragmentos vivían en un mismo bloque de Portable Text con la marca en uno solo de sus tramos, y la migración lo serializó fielmente. Se separa en dos párrafos.

### _Sombras sobre vidrio esmerilado_ — no se toca

Su envío poético quedó como texto en negrita y cursiva en línea propia, que ya lo separa del cuerpo. Queda fuera de la tabla y, por lo tanto, fuera del filtro.

## Orden de despliegue: **independiente del código**

No cambia el nombre ni la forma de ningún campo. El cuerpo de cada sección sigue siendo Markdown antes y después, y el pipeline ya renderiza cita, énfasis y párrafos. **Puede correr en cualquier momento respecto de un despliegue.**

La única dependencia con el código es que la cita sobreviva al saneamiento del pipeline. Está verificada y cubierta por un caso del spec de `markdown-pipeline.utils`: si alguien acotara la lista blanca y la cita cayera, ese caso se pone rojo antes de que estos pasajes pierdan su texto.

## Idempotencia y fail-fast

El motor distingue **tres** resultados por corrección, y esa distinción es el diseño:

| Resultado   | Cuándo                                           | Qué hace                      |
| ----------- | ------------------------------------------------ | ----------------------------- |
| Aplicada    | Aparece la forma de origen                       | Transforma                    |
| Ya aplicada | Aparece la forma de destino                      | No emite patch                |
| Ausente     | No aparece ninguna de las dos **en esa sección** | Se resuelve a nivel documento |

Ausente no lanza en el motor porque una corrección vive en una sola sección: quien puede concluir que falta es quien ve el documento entero, y ahí sí **aborta la corrida** nombrando documento y corrección. Sí lanzan de inmediato la **ocurrencia múltiple** —elegir la primera reescribiría un pasaje que nadie miró— y el **ancla presente sin su marco**, que es una inconsistencia que ninguna otra sección puede desmentir.

Como la migración emite patches y no creaciones, una segunda corrida no emite ninguna mutación y **el contador de la CLI sirve como señal de idempotencia** — a diferencia de las migraciones basadas en `createIfNotExists`, donde el contador vuelve a reportar el total.

## Procedimiento

El sync de datasets es `production → staging + development` (borrado e importación nocturnos), así que alcanza con aplicar contra producción: el espejo propaga. Hasta que corra, los otros dos conservan el texto viejo, lo que es inocuo porque ninguna prueba end-to-end afirma sobre esta prosa.

### 1. Censo previo

```bash
pnpm exec sanity documents query --api-version v2021-06-07 --dataset production \
  '*[_id in ["lw-from-story-bd3bbc87-71bd-4374-9cf8-417e915669c7","lw-from-story-e1138575-5c25-41c4-9bd2-4793642ceb62","lw-from-story-666dac9b-9086-4db9-a17c-d38f6f09532c"]]{_id, "secciones": count(content)}'
```

`--api-version v2021-06-07` **no es opcional**: la versión que la CLI elige sola consulta con perspectiva de publicados y los borradores no aparecen, sin advertencia. El censo tiene que poder afirmar que no hay ninguno.

### 2. Ensayo

```bash
pnpm exec sanity migration run restore-centered-block-semantics --dataset production > dry-run.txt
```

Contrastar los patches impresos **carácter a carácter** contra el resultado buscado: las dos citas con `>` en su línea intermedia, las reglas del marco ausentes, la firma en cursiva al cierre y la separación del encabezado de parte. El ensayo imprime las mutaciones que la migración emite y **no llega al servidor**, así que no valida nada del content lake: este contraste es un paso, no una sugerencia.

### 3. Aplicación

```bash
pnpm exec sanity migration run restore-centered-block-semantics --dataset production --no-dry-run --no-confirm
```

### 4. Verificación

Sobre el cuerpo de las tres obras: contiene la cita del aviso de apertura; no contiene la secuencia regla-encabezado del marco; termina en la firma en cursiva; y contiene el encabezado de parte separado del texto que lo sigue.

Después, **un segundo ensayo debe reportar cero mutaciones**.

Por último, la comprobación visual en la página de lectura de las tres obras, teniendo en cuenta que la caché de borde sirve contenido revalidándolo en segundo plano: la fuente se verifica por consulta y recién después la página.

## Reversión

**No se escribe migración inversa.** El cambio es una corrección editorial de texto, no la creación de documentos: el historial de Sanity conserva la versión previa de los tres, y una inversa mecánica reintroduciría prosa que ya se decidió descartar.
