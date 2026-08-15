/**
 * Exige que todo apilamiento declarado en un `.css` salga de la escala del Design System: una declaración
 * `z-index` solo admite una palabra clave de CSS o `var(--z-index-<capa>)`, y un `@apply` solo admite las
 * utilidades de la escala.
 *
 * Es la mitad de la cobertura que ESLint no puede dar: no lintea archivos `.css`, así que sin esta regla
 * las hojas de componente quedarían como la vía libre para un número crudo.
 *
 * `allowGlobalLayersIn` reserva la franja alta igual que su contraparte de ESLint: las capas globales solo
 * se habilitan en el archivo que declara una capa de la aplicación.
 *
 * `src/tailwind.css` no necesita excepción: ahí los tokens son custom properties, no declaraciones
 * `z-index`, así que la regla no los mira.
 */
import stylelint from 'stylelint';

import { isAllowedDeclarationValue, isAllowedUtility, isGlobalUtility, scaleTokens } from '../z-index-scale.js';

const { createPlugin, utils } = stylelint;

const ruleName = 'cuentoneta/z-index-scale';
const messages = utils.ruleMessages(ruleName, {
	rejectedDeclaration: (value) =>
		`"z-index: ${value}" is outside the stacking scale. Reference a layer with var(--z-index-<layer>) (${scaleTokens().join(', ')}) — see angular-components.md#escala-de-apilamiento-z-index.`,
	rejectedUtility: (utility) =>
		`"${utility}" is not part of the stacking scale. Use one of its layers (${scaleTokens().join(', ')}) or z-auto — see angular-components.md#escala-de-apilamiento-z-index.`,
	rejectedGlobalLayer: (utility) =>
		`"${utility}" is a global layer, reserved for the fixed navigation bar and the floating layer. Raise with an internal layer and confine the component's stacking with isolate — see angular-components.md#escala-de-apilamiento-z-index.`,
});
const meta = {
	url: 'https://github.com/cuentoneta/cuentoneta/blob/develop/.claude/references/angular-components.md#escala-de-apilamiento-z-index',
};

const UTILITY_PATTERN = /(?:^|\s)(-?z-[^\s]+)/g;

function utilitySuffix(utility) {
	// Descarta la variante (`md:z-nav` → `z-nav`) para quedarse con la capa que nombra.
	const withoutVariants = utility.slice(utility.lastIndexOf(':') + 1);
	return withoutVariants.startsWith('z-') ? withoutVariants.slice(2) : null;
}

function checkApply(atRule, result, allowGlobals) {
	for (const [, utility] of atRule.params.matchAll(UTILITY_PATTERN)) {
		const suffix = utilitySuffix(utility);
		if (suffix === null) {
			continue;
		}
		if (utility.startsWith('-') || !isAllowedUtility(suffix)) {
			utils.report({ message: messages.rejectedUtility(utility), node: atRule, result, ruleName });
			continue;
		}
		if (!allowGlobals && isGlobalUtility(suffix)) {
			utils.report({ message: messages.rejectedGlobalLayer(utility), node: atRule, result, ruleName });
		}
	}
}

const ruleFunction = (primary, secondary) => (root, result) => {
	if (!utils.validateOptions(result, ruleName, { actual: primary, possible: [true] })) {
		return;
	}

	const allowedGlobalFiles = secondary?.allowGlobalLayersIn ?? [];
	const filename = String(root.source?.input?.from ?? '').replaceAll('\\', '/');
	const allowGlobals = allowedGlobalFiles.some((allowed) => filename.endsWith(allowed));

	root.walkDecls(/^z-index$/i, (declaration) => {
		if (!isAllowedDeclarationValue(declaration.value)) {
			utils.report({
				message: messages.rejectedDeclaration(declaration.value),
				node: declaration,
				result,
				ruleName,
			});
		}
	});

	root.walkAtRules(/^apply$/i, (atRule) => checkApply(atRule, result, allowGlobals));
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
