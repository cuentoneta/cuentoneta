module.exports = {
	printWidth: 120,
	singleQuote: true,
	useTabs: true,
	tabWidth: 2,
	semi: true,
	bracketSpacing: true,
	arrowFunctionParentheses: true,
	plugins: ['prettier-plugin-organize-attributes', 'prettier-plugin-tailwindcss'],
	attributeGroups: ['$ANGULAR_OUTPUT', '$ANGULAR_TWO_WAY_BINDING', '$ANGULAR_INPUT', '$ANGULAR_STRUCTURAL_DIRECTIVE'],
};
