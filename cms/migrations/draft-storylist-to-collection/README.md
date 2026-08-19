# `draft-storylist-to-collection`

Crea una colección **en borrador** por cada storylist en borrador que esté completa. Comparte el núcleo de armado con [`storylist-to-collection`](../storylist-to-collection/README.md), que documenta el mapeo campo por campo, la fuerza de las referencias y el procedimiento. Acá va **solo lo que cambia**.

## Qué admite el filtro, y por qué

```
_id in path('drafts.**') && defined(title) && defined(slug.current) && count(description) > 0 && count(stories) > 0
```

El principio es que **el filtro admite exactamente lo que el destino declara requerido**, y el destino son dos capas:

- El **schema del Studio** exige `title`, `slug` y `description`.
- La **factory del dominio** exige además al menos una obra: `createCollection` rechaza una colección sin obras literarias, y `createCollectionTeaser` rechaza un contador menor a uno.

Sin esa última condición la migración escribiría un documento que el dominio **nunca puede construir**: la falla no aparecería al migrar sino al mapear, lejos de donde se corrige.

No es una lista de casos observados. Si alguna de las dos capas cambia lo que exige, el filtro cambia con ella.

Semántica de GROQ que conviene tener presente: un campo ausente hace que `count(...)` devuelva `null`, y `null > 0` es falso, así que ausente y vacío se excluyen por igual. El spec lo **ejecuta** con el motor real en vez de comparar el filtro como texto.

## El corte medido

De 9 storylists en borrador, el filtro admite **3**:

| Colección                                     | Obras | Referencias colgantes tras reapuntar |
| --------------------------------------------- | ----: | -----------------------------------: |
| Cuentos originales                            |    15 |                                    0 |
| Cuentos cortos para el verano #6: Chéjov/Vela |     3 |                                    0 |
| Semanario - 50/2025                           |     6 |                                    0 |

Las **6 excluidas**: cinco por no tener descripción y una —"3 cuentos: Lermo Balbi"— por no tener obras. Ninguna se excluye por título ni por slug.

Entre las excluidas por descripción está **"Los días siguientes y otros relatos"**, que además es el único caso asimétrico del corpus: 16 de sus referencias apuntan a cuentos que existen solo como borradores incompletos, sin obra migrada en ninguna forma. Cae por el filtro general, sin nombrarla y sin ninguna condición ad-hoc, que es la propiedad deseable.

Vale explicitar por qué no se la migra con esas referencias colgantes, ahora que la fuerza se preserva del origen. La asimetría es real: en el **origen**, la referencia débil apunta a un cuento que existe como borrador, el editor lo ve en el Studio y publicarlo cierra el agujero. En el **destino** apuntaría a un documento que no existe en ninguna forma y que ninguna acción del Studio crea: la promesa de `_strengthenOnPublish` sería incumplible. Un agujero sin camino de reparación es peor que una exclusión visible — la exclusión se ve en el censo, el agujero no se ve en ningún lado.

### La columna de colgantes del censo no es un extra

Hoy da cero para las tres admitidas. Si algún día da distinto de cero, se completa editorialmente el cuento y se vuelve a correr `draft-story-to-literary-work`; **nunca** se migra la colección con agujeros.

Es la única defensa ante el escenario concreto: si alguien le carga una descripción y obras a "Los días siguientes" y vuelve a correr la migración, entra con sus 16 colgantes. Por eso el censo es un paso obligatorio del procedimiento.

## Nada se publica

El identificador derivado conserva el prefijo de path del origen y lo reaplica **encabezando**, así que una storylist inédita produce una colección inédita. Las queries del sitio excluyen borradores: nada de esto llega a una página.

**Dos de las tres admitidas tienen versión publicada** (Chéjov/Vela y Semanario 50/2025), así que producen el borrador de su **misma** colección: ambos identificadores derivan del mismo uuid. No nace una colección distinta ni se toca la publicada.

En el Studio esos dos van a aparecer como **cambios sin publicar que nadie hizo**. Es esperado, no un error. Antes de publicar uno conviene comparar ambas versiones: publicarlo reemplazaría el contenido de la versión publicada, incluidas las correcciones editoriales posteriores a la migración.

## Consecuencia editorial de las referencias débiles

"Cuentos originales" migra con 14 referencias débiles a obras que existen solo como borradores. Es fiel al origen y no rompe nada mientras la colección esté en borrador, porque el sitio no lee borradores. Pero **al publicarla, esas obras no publicadas desaparecen del listado sin ningún error**. Conviene saberlo antes de publicar.

## Cuidado con el limpiador de borradores

`scripts/remove-all-unpublished-drafts.ts` borra **todos** los borradores del dataset: correrlo después de esta migración se lleva puestas las colecciones que crea.

## Revertir

```bash
pnpm -C cms exec sanity migration run revert-draft-storylist-to-collection --project "$(node --env-file=cms/.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" --dataset <ds> --no-dry-run --no-confirm
```

Es la que corresponde para reintentar **este** lote. La reversión amplia alcanza las dos formas del identificador y se llevaría también las colecciones publicadas, que son sobre las que se construye la página nueva.
