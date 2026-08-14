/**
 * Exige que todo apilamiento salga de la escala del Design System: las utilidades `z-<capa>` del `@theme`
 * y `z-auto`, nunca un número crudo (`z-10`, `z-[999]`) ni una declaración `z-index` con un valor propio.
 *
 * Existe porque ningún gate de compilación puede avisar. Tailwind resuelve `z-10` sin consultar el tema,
 * así que el número compila para siempre; y una utilidad mal escrita (`z-nvv`) no emite CSS alguno **ni
 * falla el build**, de modo que el defecto viaja invisible hasta que alguien lo ve en pantalla.
 *
 * Con `allowGlobalLayersIn` la regla además reserva la franja alta: las capas globales —la barra fija y la
 * capa flotante anclada al body— quedan habilitadas solo en los archivos que las declaran. Sin esa
 * reserva, cualquier componente de página podría volver a elegir un valor que compita con la barra, que es
 * el modo de falla que la escala vino a cerrar.
 *
 * Dos ramas según el archivo, porque las utilidades viven en dos formas distintas:
 * - `.html` (incluidas las plantillas inline, que el procesador de Angular extrae): escaneo del texto.
 * - `.ts`: recorrido de literales de string, que cubre `host: { class }`, mapas de clases y `styles`
 *   inline. Saltea el valor de `template`, porque de esa plantilla ya se ocupa la otra rama — sin el
 *   salteo, una violación inline se reportaría dos veces.
 *
 * Puntos ciegos declarados: un nombre de clase computado en runtime (`'z-' + n`) y una asignación directa
 * a `style.zIndex` son invisibles para un escaneo estático. Hoy no existe ninguno en el repo. Que el
 * `isolate` esté en el ancestro correcto tampoco lo decide esta regla: eso lo mide el e2e de apilamiento.
 */
import { isAllowedDeclarationValue, isAllowedUtility, isGlobalUtility, scaleTokens } from '../z-index-scale.js';

// Una utilidad de apilamiento con sus variantes: `z-nav`, `md:z-nav`, `hover:z-raised`, `z-[999]`. El
// prefijo `-` (negativo) entra a propósito: `-z-content` no pertenece a la escala y tiene que reportarse.
const UTILITY_PATTERN = /(?<![\w:-])(-?)z-((?:\[[^\]]*\])|[a-z0-9][\w.-]*)/g;
const DECLARATION_PATTERN = /(?<![\w-])z-index\s*:\s*([^;}"'`]+)/g;

// `z-index` como utilidad no existe; la coincidencia proviene de una declaración CSS, que valida el otro
// patrón. Sin esta exclusión, cada `z-index: …` se reportaría además como utilidad inválida.
const NOT_A_UTILITY = new Set(['index']);

function utilityViolations(text, allowGlobals) {
	const violations = [];
	for (const match of text.matchAll(UTILITY_PATTERN)) {
		const [, negative, suffix] = match;
		if (NOT_A_UTILITY.has(suffix)) {
			continue;
		}
		if (negative || !isAllowedUtility(suffix)) {
			violations.push({ index: match.index, length: match[0].length, messageId: 'utility', utility: match[0] });
			continue;
		}
		if (!allowGlobals && isGlobalUtility(suffix)) {
			violations.push({ index: match.index, length: match[0].length, messageId: 'globalLayer', utility: match[0] });
		}
	}
	return violations;
}

function declarationViolations(text) {
	const violations = [];
	for (const match of text.matchAll(DECLARATION_PATTERN)) {
		if (!isAllowedDeclarationValue(match[1])) {
			violations.push({
				index: match.index,
				length: match[0].length,
				messageId: 'declaration',
				value: match[1].trim(),
			});
		}
	}
	return violations;
}

/** Posición `{ line, column }` (1-based / 0-based, como las espera ESLint) del índice `index` del texto. */
function positionAt(text, index) {
	const upToIndex = text.slice(0, index);
	const lines = upToIndex.split('\n');
	return { line: lines.length, column: lines[lines.length - 1].length };
}

function reportInText(context, text, offset, node, allowGlobals) {
	const violations = [...utilityViolations(text, allowGlobals), ...declarationViolations(text)];
	for (const violation of violations) {
		const start = positionAt(text, offset + violation.index);
		const end = positionAt(text, offset + violation.index + violation.length);
		context.report({
			loc: { start, end },
			messageId: violation.messageId,
			data: { utility: violation.utility, value: violation.value, scale: scaleTokens().join(', ') },
			...(node ? { node } : {}),
		});
	}
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
	meta: {
		type: 'problem',
		docs: {
			description: 'Require z-index to come from the Design System stacking scale (@theme tokens), never a raw number.',
			url: 'https://github.com/cuentoneta/cuentoneta/blob/develop/.claude/references/angular-components.md#escala-de-apilamiento-z-index',
		},
		schema: [
			{
				type: 'object',
				properties: {
					allowGlobalLayersIn: { type: 'array', items: { type: 'string' } },
				},
				additionalProperties: false,
			},
		],
		messages: {
			utility:
				'`{{utility}}` is not part of the stacking scale. Use one of its layers ({{scale}}) or `z-auto` — see angular-components.md#escala-de-apilamiento-z-index.',
			globalLayer:
				"`{{utility}}` is a global layer, reserved for the fixed navigation bar and the floating layer. Raise with an internal layer and confine the component's stacking with `isolate` — see angular-components.md#escala-de-apilamiento-z-index.",
			declaration:
				'`z-index: {{value}}` is outside the stacking scale. Reference a layer with `var(--z-index-<layer>)` ({{scale}}) — see angular-components.md#escala-de-apilamiento-z-index.',
		},
	},
	create(context) {
		const allowedGlobalFiles = context.options[0]?.allowGlobalLayersIn ?? [];
		// La comparación es por sufijo de ruta para no depender de si ESLint entrega la ruta absoluta o
		// relativa, ni del separador de directorios del sistema operativo.
		const normalizedFilename = context.filename.replaceAll('\\', '/');
		const allowGlobals = allowedGlobalFiles.some((allowed) => normalizedFilename.endsWith(allowed));
		const sourceCode = context.sourceCode ?? context.getSourceCode();

		if (context.filename.endsWith('.html')) {
			return {
				Program(program) {
					reportInText(context, sourceCode.getText(), 0, program, allowGlobals);
				},
			};
		}

		// El literal de la plantilla inline: lo lintea la rama `.html` sobre el texto que extrae el
		// procesador de Angular, así que mirarlo también acá duplicaría cada reporte. Un `TemplateElement`
		// cuelga de su `TemplateLiteral`, y es ese el que la propiedad `template` tiene por valor.
		const isInlineTemplate = (expression) =>
			expression.parent?.type === 'Property' &&
			expression.parent.value === expression &&
			expression.parent.key.type === 'Identifier' &&
			expression.parent.key.name === 'template';

		// Se recorre el texto **fuente** del nodo, no su valor: así los índices de cada coincidencia caen
		// directamente sobre el archivo y la posición reportada no necesita traducción.
		const visitLiteral = (node, expression) => {
			if (isInlineTemplate(expression)) {
				return;
			}
			reportInText(context, sourceCode.getText(node), node.range[0], node, allowGlobals);
		};

		return {
			Literal(node) {
				if (typeof node.value === 'string') {
					visitLiteral(node, node);
				}
			},
			TemplateElement(node) {
				visitLiteral(node, node.parent);
			},
		};
	},
};
