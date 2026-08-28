import { MIGRATED_ID_PREFIX } from '../story-to-literary-work/build-literary-work-document';

/**
 * Las consultas del censo previo y de la verificación posterior, como constantes ejecutables en vez de
 * prosa en el README.
 *
 * El motivo lo dejó documentado el relinkeo de la landing: una consulta publicada que nadie ejecuta
 * puede estar inerte y aparentar que verifica, y sus dos defectos sólo aparecieron al correrla. Acá el
 * costo de un falso verde es mayor, porque el paso siguiente es irreversible: una consulta inerte
 * diría "ninguna referencia colgada" justo antes de una purga que no se deshace.
 *
 * De ahí que cada conteo lleve su `defined(...)` en el filtro del documento: recorrer un campo ausente
 * con `doc.campo[]` no da una lista vacía sino `[null]`, y cuenta de más.
 */

/**
 * Censo de los documentos que la purga se lleva, publicados y borradores por separado.
 *
 * Se corre **antes** para registrar cuánto se va, y **después** de cada dataset, donde los cuatro
 * conteos deben dar `0`.
 */
export const CENSUS_QUERY = `{
  'cuentosPublicados':    count(*[_type == 'story' && !(_id in path('drafts.**'))]),
  'cuentosEnBorrador':    count(*[_type == 'story' && _id in path('drafts.**')]),
  'listasPublicadas':     count(*[_type == 'storylist' && !(_id in path('drafts.**'))]),
  'listasEnBorrador':     count(*[_type == 'storylist' && _id in path('drafts.**')])
}`;

/**
 * Censo de las referencias que la primera migración da de baja. Deben dar `0` después de correrla.
 *
 * Son las que bloquean la purga: mientras alguna siga en pie, el content lake rechaza borrar su
 * destino.
 */
export const LEGACY_FIELDS_CENSUS_QUERY = `{
  'cards':       count(*[_type == 'landingPage' && defined(cards)].cards[]),
  'latestReads': count(*[_type == 'landingPage' && defined(latestReads)].latestReads[]),
  'mostRead':    count(*[_type == 'rotatingContent' && defined(mostRead)].mostRead[])
}`;

/**
 * Qué documentos siguen referenciando un cuento o una lista. Debe devolver `[]` antes de purgar.
 *
 * Descubre los referentes con `references()` en vez de enumerar los campos conocidos: el dataset puede
 * conservar campos de schemas dados de baja hace tiempo, y una lista escrita a mano no los vería —que
 * es exactamente la clase de dato que este issue existe para encontrar—.
 */
export const INCOMING_REFERENCES_QUERY = `*[_type in ['story', 'storylist']]{
  _id,
  _type,
  'referentes': *[references(^._id)]{ _id, _type }
}[count(referentes) > 0]`;

/**
 * Los cuentos publicados que no tienen obra derivada: lo que la purga se lleva sin contraparte.
 *
 * No aborta nada — la decisión de que desaparezcan ya está tomada. Se corre para que el censo del PR
 * los nombre, en vez de que se descubran ausentes después.
 *
 * El identificador esperado se deriva del prefijo que usa la migración de ida, importado y no
 * reescrito: con dos definiciones, una divergencia haría que este censo declarara huérfano a un cuento
 * que sí migró.
 */
export const WORKS_WITHOUT_COUNTERPART_QUERY = `*[
  _type == 'story' &&
  !(_id in path('drafts.**')) &&
  !defined(*[_id == '${MIGRATED_ID_PREFIX}' + ^._id][0])
]{ _id, 'slug': slug.current }`;

/**
 * Referencias del dataset que dejaron de resolver, tras la purga. Debe devolver `[]`.
 *
 * `[!defined(@->_id)]` **filtra** los miembros cuyo destino no existe. Comparar "conteo resuelto contra
 * conteo de origen" no sirve: dereferenciar conserva el `null` del destino ausente y `count()` lo
 * cuenta, así que los dos números coinciden aunque todas las referencias estén colgadas.
 */
export const DANGLING_AFTER_PURGE_QUERY = `{
  'collections':   count(*[_type == 'landingPage' && defined(collections)].collections[!defined(@->_id)]),
  'latestWorks':   count(*[_type == 'landingPage' && defined(latestLiteraryWorks)].latestLiteraryWorks[!defined(@->_id)]),
  'mostReadWorks': count(*[_type == 'rotatingContent' && defined(mostReadLiteraryWorks)].mostReadLiteraryWorks[!defined(@->_id)]),
  'obrasDeColeccion': count(*[_type == 'collection' && defined(literaryWorks)].literaryWorks[!defined(@->_id)])
}`;
