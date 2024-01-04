/**
 * Interfaces utilizadas para el manejo de los bloques de texto en el CMS
 * "BlockContent" es un tipo de dato que se utiliza para almacenar los bloques de texto en Sanity.
 *
 * A fin de hacer más robusto el manejo de los bloques de texto, se declara esta interfaz y sus dependencias.
 */

export interface BlockContent {
    _type: 'block';
    _key: string;
    children: Block[];
    markDefs?: MarkDef[];
    style?: string;
}

export interface Block {
    _type: string;
    _key: string;
    text: string;
    marks?: string[];
}

export interface MarkDef {
    _type: string;
    _key: string;
    href: string;
}
