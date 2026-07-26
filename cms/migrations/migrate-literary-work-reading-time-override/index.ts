import { defineMigration, at, setIfMissing, unset } from 'sanity/migrate';

// El campo `readingTimeOverride` desaparece del schema: el total de la obra ahora vive en un único campo
// editable `totalReadingTime` (el backend lo materializa en obras de texto; el editor lo setea a mano en
// recitados/audiovisuales). En las obras que tenían override, ese valor ES la duración editorial del medio
// y hay que PRESERVARLO: se copia a `totalReadingTime` con `setIfMissing` (no pisa un total ya seteado)
// ANTES de quitar el campo huérfano. Sin esa preservación, la próxima lectura materializaría el total con
// la suma del texto (la sección editorial mínima del recitado) ≠ duración del medio, hasta corrección
// manual. Las obras sin override no necesitan nada. Correr dry-run antes de aplicar.
export default defineMigration({
	title: 'Migrar readingTimeOverride de las obras literarias a totalReadingTime',
	documentTypes: ['literaryWork'],
	migrate: {
		document(doc) {
			if (typeof doc.readingTimeOverride !== 'number') {
				return [];
			}
			return [at('totalReadingTime', setIfMissing(doc.readingTimeOverride)), at('readingTimeOverride', unset())];
		},
	},
});
