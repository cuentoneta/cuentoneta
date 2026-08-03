// Permite importar el contenido crudo de un archivo Markdown como string vía el sufijo `?raw` de Vite
// (Storybook y Vitest corren sobre Vite). Lo usa el corpus de mocks para materializar `bodyHtml` desde
// la ficha `.md` co-locada, sin un paso de build ni duplicar el cuerpo en un `.ts` generado.
declare module '*.md?raw' {
	const content: string;
	export default content;
}
