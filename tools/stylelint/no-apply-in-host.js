/**
 * Prohíbe `@apply` dentro de un bloque `:host` "pelado" en archivos `.css`.
 * Esas utilidades van en `host: { class }` del decorador. Por diseño NO reporta
 * `:host ::ng-deep`, `:host(.clase)` ni los `@apply` anidados en un selector hijo
 * (solo el `@apply` cuyo padre directo es un `rule` con selector exactamente `:host`).
 *
 * Complementa la regla ESLint `no-apply-in-host-styles`, que cubre los estilos
 * inline en `.ts` (los `.css` no se lintean por ESLint y viceversa).
 */
import stylelint from 'stylelint';

const { createPlugin, utils } = stylelint;

const ruleName = 'cuentoneta/no-apply-in-host';
const messages = utils.ruleMessages(ruleName, {
	rejected:
		"Move the utilities from :host { @apply ... } to the decorator's host: { class } — see angular-components.md#host-element.",
});
const meta = {
	url: 'https://github.com/cuentoneta/cuentoneta/blob/develop/.claude/references/angular-components.md#host-element',
};

function isBareHost(selector) {
	return String(selector)
		.split(',')
		.map((part) => part.trim())
		.some((part) => part === ':host');
}

const ruleFunction = (primary) => (root, result) => {
	if (!utils.validateOptions(result, ruleName, { actual: primary, possible: [true] })) {
		return;
	}
	root.walkAtRules(/^apply$/i, (atRule) => {
		const parent = atRule.parent;
		if (parent && parent.type === 'rule' && isBareHost(parent.selector)) {
			utils.report({ message: messages.rejected, node: atRule, result, ruleName });
		}
	});
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
