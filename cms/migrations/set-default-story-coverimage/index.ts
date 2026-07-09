import { defineMigration, at, setIfMissing } from 'sanity/migrate';

// Mismo asset placeholder que el `initialValue` del schema; el _type es necesario para un valor de imagen válido.
const defaultStoryCoverImage = {
	_type: 'image',
	asset: { _type: 'reference', _ref: 'image-852a122db56840452a0b7e2e58d73741de44bb01-229x320-svg' },
};

// Backfill para que `coverImage` (ahora requerido) no invalide las historias creadas antes del campo.
// initialValue solo cubre documentos nuevos; esta migración cubre los existentes.
export default defineMigration({
	title: 'Setear coverImage por defecto en historias existentes',
	documentTypes: ['story'],
	migrate: {
		document() {
			return [at('coverImage', setIfMissing(defaultStoryCoverImage))];
		},
	},
});
