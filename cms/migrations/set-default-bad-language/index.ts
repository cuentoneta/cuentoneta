import { at, defineMigration, setIfMissing } from 'sanity/migrate';

// `initialValue: false` solo alcanza a los documentos que nacen después de declararlo: los anteriores
// quedaron sin valor, y el campo dice si la obra contiene lenguaje adulto — una ausencia se lee como
// "no" sin que nadie lo haya afirmado. Las queries ya aplican el valor por defecto al proyectar, pero
// eso resuelve la lectura y no el dato: el documento sigue sin decir qué es.
//
// Alcanza a los dos agregados que declaran el campo, y tiene que correr antes de que la regla los
// exija a los dos: al revés, el Studio marca en rojo lo que todavía no está corregido.
export default defineMigration({
	title: 'Setear en false el lenguaje adulto no declarado',
	documentTypes: ['story', 'literaryWork'],
	migrate: {
		document() {
			// `setIfMissing` no pisa un `true` cargado a mano, y vuelve la corrida idempotente.
			return [at('badLanguage', setIfMissing(false))];
		},
	},
});
