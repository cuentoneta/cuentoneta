export default {
	printWidth: 120,
	singleQuote: true,
	useTabs: true,
	tabWidth: 2,
	semi: true,
	bracketSpacing: true,
	arrowFunctionParentheses: true,
	plugins: ['prettier-plugin-organize-attributes', 'prettier-plugin-tailwindcss'],
	// Hoja de estilos de entrada de Tailwind v4, usada por el plugin para resolver la configuración del tema.
	tailwindStylesheet: './src/styles.css',
	attributeGroups: ['$ANGULAR_OUTPUT', '$ANGULAR_TWO_WAY_BINDING', '$ANGULAR_INPUT', '$ANGULAR_STRUCTURAL_DIRECTIVE'],
};
