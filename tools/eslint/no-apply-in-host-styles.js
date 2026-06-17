/**
 * Prohíbe `@apply` dentro de un bloque `:host` "pelado" en los estilos inline de
 * componentes (`styles:` del decorador). Esas utilidades van en `host: { class }`.
 *
 * El selector AST cubre los estilos inline en `.ts`; los `.css` standalone los
 * cubre la regla de Stylelint `cuentoneta/no-apply-in-host`. Por diseño NO matchea
 * `:host ::ng-deep`, `:host(.clase)` ni los `@apply` anidados en un selector hijo.
 */

// `:host {` seguido de `@apply` sin llaves intermedias: el @apply está directo en
// el bloque del host. `[^{}]*` corta ante cualquier `{`/`}`, así que un `@apply`
// anidado (`:host { .child { @apply } }`) o `:host ::ng-deep { @apply }` no matchea.
const BARE_HOST_APPLY = /:host\s*\{[^{}]*@apply/i;

function stylesText(node) {
	if (!node) {
		return '';
	}
	if (node.type === 'TemplateLiteral') {
		return node.quasis.map((quasi) => quasi.value.raw).join(' ');
	}
	if (node.type === 'Literal' && typeof node.value === 'string') {
		return node.value;
	}
	if (node.type === 'ArrayExpression') {
		return node.elements.map(stylesText).join('\n');
	}
	return '';
}

/** @type {import('eslint').Rule.RuleModule} */
export default {
	meta: {
		type: 'problem',
		docs: {
			description:
				'Disallow @apply inside a bare :host block in component inline styles; move utilities to host: { class }.',
		},
		schema: [],
		messages: {
			applyInHost:
				"Move the utilities from `:host { @apply ... }` to the decorator's `host: { class }` — see angular-components.md#host-element.",
		},
	},
	create(context) {
		return {
			Property(node) {
				const key = node.key;
				const keyName = key.type === 'Identifier' ? key.name : key.type === 'Literal' ? key.value : null;
				if (keyName !== 'styles') {
					return;
				}
				if (BARE_HOST_APPLY.test(stylesText(node.value))) {
					context.report({ node: node.value, messageId: 'applyInHost' });
				}
			},
		};
	},
};
