/**
 * Exige que todo apilamiento declarado en un `.css` salga de la escala del Design System: una declaración
 * `z-index` solo admite una palabra clave de CSS o `var(--z-index-<capa>)`, y un `@apply` solo admite las
 * utilidades de la escala.
 *
 * Es la mitad de la cobertura que ESLint no puede dar: no lintea archivos `.css`, así que sin esta regla
 * las hojas de componente quedarían como la vía libre para un número crudo. `allowGlobalLayersIn` reserva
 * la franja alta igual que su contraparte de ESLint. La escala y su rationale, en
 * `angular-components.md#escala-de-apilamiento-z-index`.
 *
 * `src/tailwind.css` no necesita excepción: ahí los tokens son custom properties, no declaraciones
 * `z-index`, así que la regla no los mira.
 */
import stylelint from 'stylelint';

import {
	declaredLayer,
	isAllowedDeclarationValue,
	isAllowedUtility,
	isGlobalUtility,
	allowedTokensFor,
} from '../z-index-scale.js';

const { createPlugin, utils } = stylelint;

const ruleName = 'cuentoneta/z-index-scale';
const messages = utils.ruleMessages(ruleName, {
	// El listado de capas sale de `allowedTokensFor`, no de la escala entera: ofrecerle una capa global a un
	// archivo que no puede declararla sugeriría una salida que la regla rechaza en el paso siguiente.
	rejectedDeclaration: (value, allowed) =>
		`"z-index: ${value}" is outside the stacking scale. Reference a layer with var(--z-index-<layer>) (${allowed.join(', ')}) — see angular-components.md#escala-de-apilamiento-z-index.`,
	rejectedUtility: (utility, allowed) =>
		`"${utility}" is not part of the stacking scale. Use one of its layers (${allowed.join(', ')}) or z-auto — see angular-components.md#escala-de-apilamiento-z-index.`,
	rejectedGlobalLayer: (utility) =>
		`"${utility}" is a global layer, reserved for the fixed navigation bar and the floating layer. Raise with an internal layer and confine the component's stacking with isolate — see angular-components.md#escala-de-apilamiento-z-index.`,
});
const meta = {
	url: 'https://github.com/cuentoneta/cuentoneta/blob/develop/.claude/references/angular-components.md#escala-de-apilamiento-z-index',
};

// Admite las variantes que preceden a la utilidad (`md:z-nav`, `sm:hover:z-10`): sin contemplarlas, toda
// utilidad prefijada entraría sin que la regla la mire.
const UTILITY_PATTERN = /(?:^|\s)((?:[\w-]+:)*-?z-[^\s]+)/g;

/** La capa que nombra la utilidad, o `null` si el negativo la deja fuera de la escala por definición. */
function utilitySuffix(utility) {
	// Descarta la variante (`md:z-nav` → `z-nav`) para quedarse con la capa que nombra. El negativo se
	// evalúa después de descartarla, porque `md:-z-content` no empieza con el guion.
	const withoutVariants = utility.slice(utility.lastIndexOf(':') + 1);
	// El guion del negativo se saca antes de leer la capa: `md:-z-content` la nombra igual, y descartarlo
	// acá lo dejaría sin reportar en vez de rechazarlo.
	const withoutSign = withoutVariants.startsWith('-') ? withoutVariants.slice(1) : withoutVariants;
	return withoutSign.startsWith('z-') ? withoutSign.slice(2) : null;
}

function isNegative(utility) {
	return utility.slice(utility.lastIndexOf(':') + 1).startsWith('-');
}

function checkApply(atRule, result, allowGlobals) {
	for (const [, utility] of atRule.params.matchAll(UTILITY_PATTERN)) {
		const suffix = utilitySuffix(utility);
		if (suffix === null) {
			continue;
		}
		if (isNegative(utility) || !isAllowedUtility(suffix)) {
			utils.report({
				message: messages.rejectedUtility(utility, allowedTokensFor(allowGlobals)),
				node: atRule,
				result,
				ruleName,
			});
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
				message: messages.rejectedDeclaration(declaration.value, allowedTokensFor(allowGlobals)),
				node: declaration,
				result,
				ruleName,
			});
			return;
		}
		// La franja alta se reserva también en esta forma: de lo contrario, lo que `z-nav` prohíbe lo
		// concedería la declaración equivalente.
		if (!allowGlobals && isGlobalUtility(declaredLayer(declaration.value) ?? '')) {
			utils.report({
				message: messages.rejectedGlobalLayer(declaration.value),
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
