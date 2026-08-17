# Setear en false el lenguaje adulto no declarado

El campo dice si la obra contiene lenguaje adulto, y `initialValue: false` solo alcanza a los
documentos que nacen después de haberlo declarado. Los anteriores quedaron **sin valor**, que no es lo
mismo que un "no": nadie lo afirmó.

Las queries ya aplican el valor por defecto al proyectar, así que la aplicación no ve el hueco. Pero
eso resuelve la lectura y no el dato — el documento sigue sin decir qué es, y cualquier consumidor que
lo lea por fuera de esas proyecciones (una exportación, un reporte, el propio Studio) ve la ausencia.

## Censo

Medido contra `production` el 2026-08-17:

| Tipo           | Publicados sin `badLanguage` | Total (con borradores) |
| -------------- | ---------------------------: | ---------------------: |
| `story`        |                          155 |             166 de 708 |
| `literaryWork` |                          155 |             157 de 681 |

Treinta y seis documentos sí lo declaran en `true` —dieciocho por tipo—: `setIfMissing` no los toca.

## El orden respecto de la regla

Hasta este cambio, `badLanguage` era requerido en `story` y opcional en `literaryWork` — el mismo
campo con dos reglas, y la razón por la que el barrido de campos requeridos reportaba solo el primero:
mide lo que el schema declara.

La regla ahora rige en los dos, y **el saneamiento va primero**: al revés, el Studio marcaría en rojo
155 obras antes de que estén corregidas. Es la misma razón por la que la validación de forma de URL
llegó después de sanear los recursos.

## Cómo se corre

Dry-run por defecto, y una corrida por dataset:

```bash
pnpm -C cms exec sanity migration run set-default-bad-language --project s4dbqkc5 --dataset <ds>
pnpm -C cms exec sanity migration run set-default-bad-language --project s4dbqkc5 --dataset <ds> --no-dry-run --no-confirm
```

`--project` es obligatorio junto con `--dataset`, y `--no-confirm` hace falta en un entorno no
interactivo.

Es **independiente del código**: no renombra un campo ni cambia la forma de un valor, así que los dos
órdenes respecto del despliegue son seguros.

## Verificación

Que la corrida reporte N mutaciones dice cuántos documentos **alcanzó**, no qué escribió el servidor
—`setIfMissing` se decide del lado del servidor, así que emite un patch por documento aunque no toque
ninguno—. Se verifica consultando el resultado:

```groq
count(*[_type in ["story","literaryWork"] && !defined(badLanguage)])
```

Debe dar `0`. Y que las declaradas en `true` sigan estando:

```groq
count(*[_type in ["story","literaryWork"] && badLanguage == true])
```
