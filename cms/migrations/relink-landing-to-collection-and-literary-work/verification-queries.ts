/**
 * Las consultas con las que se verifica la corrida, como constantes ejecutables en vez de prosa en el
 * README.
 *
 * El motivo es el mismo por el que el spec de la migración evalúa su `filter` con el motor de GROQ en
 * lugar de compararlo como texto: una consulta publicada que nadie ejecuta puede estar inerte y aparentar
 * que verifica. Estas tuvieron dos defectos que sólo aparecieron al ejecutarlas, y ninguno de los dos era
 * visible leyéndolas.
 *
 * **Los dos defectos vienen del mismo lugar:** recorrer un campo ausente. `doc.campo[]` sobre un
 * documento que no lo declara no produce una lista vacía sino `[null]`, así que:
 *
 * - contarlo daba **uno de más** por cada documento sin migrar, y
 * - filtrarlo por destino inexistente daba un **falso positivo** por cada uno de ellos.
 *
 * De ahí que cada conteo lleve su `defined(...)` en el filtro del documento: acota el recorrido a los que
 * efectivamente tienen el campo.
 */

/** Paridad entre cada campo nuevo y su origen. Cada campo nuevo debe igualar a su par. */
export const PARITY_QUERY = `{
  'cards':          count(*[_type == 'landingPage' && defined(cards)].cards[]),
  'collections':    count(*[_type == 'landingPage' && defined(collections)].collections[]),
  'latestReads':    count(*[_type == 'landingPage' && defined(latestReads)].latestReads[]),
  'latestWorks':    count(*[_type == 'landingPage' && defined(latestLiteraryWorks)].latestLiteraryWorks[]),
  'mostRead':       count(*[_type == 'rotatingContent' && defined(mostRead)].mostRead[]),
  'mostReadWorks':  count(*[_type == 'rotatingContent' && defined(mostReadLiteraryWorks)].mostReadLiteraryWorks[])
}`;

/**
 * Referencias nuevas que no resuelven. Los tres conteos deben dar `0`.
 *
 * `[!defined(@->_id)]` **filtra** los miembros cuyo destino no existe. La forma que compara "conteo
 * resuelto contra conteo de origen" no sirve: dereferenciar conserva el `null` del destino ausente y
 * `count()` lo cuenta, así que los dos números coinciden aunque todas las referencias estén colgadas.
 */
export const DANGLING_QUERY = `{
  'collections':   count(*[_type == 'landingPage' && defined(collections)].collections[!defined(@->_id)]),
  'latestWorks':   count(*[_type == 'landingPage' && defined(latestLiteraryWorks)].latestLiteraryWorks[!defined(@->_id)]),
  'mostReadWorks': count(*[_type == 'rotatingContent' && defined(mostReadLiteraryWorks)].mostReadLiteraryWorks[!defined(@->_id)])
}`;

/**
 * Documentos donde un campo nuevo no tiene tantas referencias como su origen. Debe devolver `[]`.
 *
 * La paridad agregada no alcanza: un documento con dos de más y otro con dos de menos suman igual.
 */
export const PER_DOCUMENT_MISMATCH_QUERY = `*[
  (_type == 'landingPage' && (count(cards) != count(collections) || count(latestReads) != count(latestLiteraryWorks))) ||
  (_type == 'rotatingContent' && count(mostRead) != count(mostReadLiteraryWorks))
]._id`;

/**
 * Documentos que la reversión no podría revertir, porque su campo de origen ya no está poblado. Debe
 * devolver `[]` antes de revertir: si no, la corrida abortaría a mitad de camino, dejando unos documentos
 * revertidos y otros no.
 */
export const UNREVERTIBLE_QUERY = `*[
  (_type == 'landingPage' && ((defined(collections) && !defined(cards)) || (defined(latestLiteraryWorks) && !defined(latestReads)))) ||
  (_type == 'rotatingContent' && defined(mostReadLiteraryWorks) && !defined(mostRead))
]._id`;

/** Borradores en vuelo. Publicar uno creado antes de la corrida pisa el documento migrado con su contenido. */
export const DRAFTS_IN_FLIGHT_QUERY = `*[_id in path('drafts.**') && _type in ['landingPage', 'rotatingContent']]._id`;
