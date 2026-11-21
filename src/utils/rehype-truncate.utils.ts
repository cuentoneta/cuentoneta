import { wordBoundaryEnd } from '@utils/text-excerpt.utils';

// Tipado estructural mínimo del hast: alcanza para podar el árbol sin acoplar @types/hast.
interface HtmlNode {
	readonly type: string;
	readonly children?: readonly HtmlNode[];
	readonly value?: string;
}

// Concatenación de los text nodes en orden de documento. Un <br> no aporta nada: el salto de verso ya
// llega como el '\n' del text node que lo sigue.
function plainText(node: HtmlNode): string {
	if (node.type === 'text') {
		return node.value ?? '';
	}
	return (node.children ?? []).map(plainText).join('');
}

// Copia del nodo con solo los primeros `budget.remaining` caracteres de texto; descuenta del presupuesto
// lo que conserva. Devuelve null para todo lo que queda después del corte, y para un elemento que tenía
// texto y se quedó sin él. Un elemento sin hijos, como <img> o <hr>, se conserva si está antes del corte.
function truncateNode(node: HtmlNode, budget: { remaining: number }): HtmlNode | null {
	if (budget.remaining <= 0) {
		return null;
	}
	if (node.type === 'text') {
		const value = (node.value ?? '').slice(0, budget.remaining);
		budget.remaining -= value.length;
		return { ...node, value };
	}
	if (!node.children || node.children.length === 0) {
		return node;
	}
	const children = node.children.map((child) => truncateNode(child, budget)).filter((child) => child !== null);
	return node.type === 'element' && children.length === 0 ? null : { ...node, children };
}

// El `…` va dentro del último texto que quedó, para no sumar un nodo suelto fuera de su párrafo.
function appendEllipsis(node: HtmlNode): HtmlNode {
	if (node.type === 'text') {
		return { ...node, value: `${node.value ?? ''}…` };
	}
	const children = [...(node.children ?? [])];
	const lastWithText = children.map((child) => plainText(child).length > 0).lastIndexOf(true);
	const target = children[lastWithText];
	if (!target) {
		return node;
	}
	children[lastWithText] = appendEllipsis(target);
	return { ...node, children };
}

/**
 * Plugin rehype que recorta el árbol a `maxLength` caracteres de texto en límite de palabra y termina el
 * último texto con `…`. Descarta todo lo que queda después del corte, imágenes incluidas. Un árbol que ya
 * cabe sale sin tocar, igual que con `maxLength` `Infinity`.
 *
 * Va después del sanitizador: solo poda nodos o acorta texto, así que no puede sumar nada fuera del
 * allow-list.
 */
export function rehypeTruncate(maxLength: number) {
	return (tree: HtmlNode): HtmlNode | undefined => {
		if (maxLength === Infinity) {
			return undefined;
		}
		const text = plainText(tree);
		if (text.length <= maxLength) {
			return undefined;
		}
		const truncated = truncateNode(tree, { remaining: wordBoundaryEnd(text, maxLength) });
		return truncated ? appendEllipsis(truncated) : undefined;
	};
}
