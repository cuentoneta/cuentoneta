# `relink-landing-to-collection-and-literary-work`

Puebla los campos de la página de inicio y del contenido rotativo que referencian **colecciones** y **obras literarias**, derivándolos de los que referencian storylists e historias. **No toca los campos de origen.**

| Documento         | Campo de origen | Campo que puebla        |
| ----------------- | --------------- | ----------------------- |
| `landingPage`     | `cards`         | `collections`           |
| `landingPage`     | `latestReads`   | `latestLiteraryWorks`   |
| `rotatingContent` | `mostRead`      | `mostReadLiteraryWorks` |

## Prerequisito

**`storylist-to-collection` y `story-to-literary-work` tienen que estar aplicadas con `--no-dry-run` en el mismo dataset.** Las referencias nuevas se derivan del identificador del documento migrado; si ese documento no existe y la referencia es fuerte, el content lake rechaza la transacción entera al escribir.

El dry-run **no** lo detecta: imprime mutaciones sin llegar al servidor. Por eso la verificación de referencias colgadas de más abajo es un paso obligatorio del procedimiento, no una sugerencia.

## Por qué campos nuevos y no un renombre

El Studio y la aplicación no despliegan a la vez. Si se reusaran los nombres de campo no habría orden seguro: desplegar el código primero lo deja leyendo documentos que todavía referencian el tipo viejo, y migrar primero deja al código todavía desplegado leyendo lo que ya cambió de forma. Con campos nuevos las dos formas conviven y ningún lector se queda sin fuente.

Los campos viejos quedan intactos. Su baja va en un PR de limpieza posterior, cuando ningún lector los consulte.

## Cuándo corre

Después de desplegar el Studio con los campos nuevos y **antes** de que la aplicación los lea. Es segura en toda esa ventana porque no modifica nada que alguien esté leyendo: los campos nuevos nacen vacíos y nadie los consulta hasta el despliegue que cambia el contrato.

**Se re-corre una vez más después de ese despliegue.** El endpoint que genera las semanas futuras copia hacia adelante los campos del último documento existente, y hasta ese despliegue arrastra sólo los viejos: cualquier semana generada en el medio nace sin los campos nuevos. La re-corrida cierra ese hueco.

Es re-corrible porque escribe con `setIfMissing` y no con `set`: un campo ya poblado —por la corrida anterior o por una edición hecha a mano en el Studio— no se pisa.

## Comandos

Desde `cms/`. El destino va siempre explícito: `--project` y `--dataset` son **inseparables** y pasar uno solo aborta. El identificador de proyecto se resuelve del entorno, nunca se escribe literal.

```bash
# Dry-run (es el comportamiento por defecto)
pnpm exec sanity migration run relink-landing-to-collection-and-literary-work \
  --project "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" \
  --dataset <destino>

# Aplicar. `--no-confirm` hace falta cuando no hay TTY.
pnpm exec sanity migration run relink-landing-to-collection-and-literary-work \
  --project "$(node --env-file=.env -p 'process.env.SANITY_STUDIO_PROJECT_ID')" \
  --dataset <destino> --no-dry-run --no-confirm
```

Orden de datasets: `development` → `staging` → `production`, con censo antes y verificación después de cada uno.

## Censo previo

```groq
{
  'landingPages': count(*[_type == 'landingPage' && !(_id in path('drafts.**'))]),
  'cards':        count(*[_type == 'landingPage' && !(_id in path('drafts.**'))].cards[]),
  'latestReads':  count(*[_type == 'landingPage' && !(_id in path('drafts.**'))].latestReads[]),
  'rotating':     count(*[_type == 'rotatingContent']),
  'mostRead':     count(*[_type == 'rotatingContent'].mostRead[])
}
```

## Verificación posterior

Dos cosas, y las dos importan:

```groq
// 1. Cada campo nuevo tiene tantas referencias como su origen.
{
  'cards':        count(*[_type == 'landingPage' && !(_id in path('drafts.**'))].cards[]),
  'collections':  count(*[_type == 'landingPage' && !(_id in path('drafts.**'))].collections[]),
  'latestReads':  count(*[_type == 'landingPage' && !(_id in path('drafts.**'))].latestReads[]),
  'latestWorks':  count(*[_type == 'landingPage' && !(_id in path('drafts.**'))].latestLiteraryWorks[]),
  'mostRead':     count(*[_type == 'rotatingContent'].mostRead[]),
  'mostReadWorks':count(*[_type == 'rotatingContent'].mostReadLiteraryWorks[])
}

// 2. Ninguna referencia nueva quedó colgada. Es la que no se puede omitir: la
//    derivación produce un identificador bien formado aunque el destino no exista.
{
  'collectionsResueltas': count(*[_type == 'landingPage'].collections[]->_id),
  'latestWorksResueltas': count(*[_type == 'landingPage'].latestLiteraryWorks[]->_id),
  'mostReadResueltas':    count(*[_type == 'rotatingContent'].mostReadLiteraryWorks[]->_id)
}
```

Los conteos de la segunda consulta tienen que coincidir con los de la primera. Si no coinciden, hay referencias apuntando a documentos que no existen y el prerequisito no estaba cumplido.

**Ningún gate de CI detecta un dataset sin migrar:** el job de e2e corre contra `staging` y pasaría en verde igual. Es responsabilidad de quien despliega.

## Reversión

`revert-relink-landing-to-collection-and-literary-work` da de baja los tres campos nuevos, y **sólo mientras su campo de origen siga poblado**. Si el origen ya no está —porque el PR de limpieza que lo retira ya corrió—, el campo nuevo pasó a ser la única copia de esas referencias y la reversión aborta en vez de destruirlas.
