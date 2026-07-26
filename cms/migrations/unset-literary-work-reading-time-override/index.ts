import { defineMigration, at, unset } from 'sanity/migrate';

// El campo `readingTimeOverride` desaparece del schema: el total de la obra ahora vive en un único
// campo editable `totalReadingTime` (el backend lo materializa en obras de texto; el editor lo setea
// a mano en recitados/audiovisuales). Esta migración quita el campo huérfano de los documentos
// existentes. Correr dry-run antes de aplicar. Para obras que tenían un override, setear su
// `totalReadingTime` a mano tras migrar (la duración del medio).
export default defineMigration({
	title: 'Quitar readingTimeOverride de las obras literarias',
	documentTypes: ['literaryWork'],
	migrate: {
		document() {
			return [at('readingTimeOverride', unset())];
		},
	},
});
