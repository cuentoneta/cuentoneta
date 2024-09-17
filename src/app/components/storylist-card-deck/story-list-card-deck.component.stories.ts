import { Meta, moduleMetadata } from '@storybook/angular';
import { StorylistCardDeckComponent } from './storylist-card-deck.component';
import { RouterTestingModule } from '@angular/router/testing';

const fullyLoadedStorylist = {
	_id: 'de027057-130b-473d-a4f7-f561c878feeb',
	count: 60,
	displayDates: true,
	editionPrefix: 'Día',
	publications: [
		{
			order: 60,
			published: true,
			publishingDate: '2022-03-01',
			story: {
				_id: 'f69c7593-9c3d-4dae-a29c-2de4bf899935',
				approximateReadingTime: 4,
				slug: 'mascaras',
				title: 'Máscaras',
				summary:
					'"Máscaras" está incluido en el volumen "Bar del Infierno", publicado en 2005. La acción de la obra se sucede en un bar del cual no es posible salir, dado que en el universo del libro el afuera no existe. En este escenario, El Narrador de Historias, protagonista principal de esta narración enmarcada, procede a contar una variedad de relatos ubicados en distintos lugares y distintas épocas.',
				paragraphs: [
					'Según cuentan algunos, el corso de la avenida La Plata, en Santos Lugares, era utilizado frecuentemente por ángeles y demonios cuando tenían que cumplir alguna misión terrestre. Solía decirse también que entre todas las máscaras del corso, una era el diablo. Los hechiceros de Lourdes y Villa Lynch aprovechaban aquellas jornadas para suscribir convenios de toda clase con los poderes de las tinieblas. Tras las caretas espeluznantes se ocultaba el verdadero horror de las caras del mal.',
					'Los hombres sensibles de Flores solían pasearse por allí tratando de reconocer el sello de las legiones, o bien gritando frases ingeniosas en el oído de las muchachas. Cada vez que sospechaban el carácter sobrenatural de algún enmascarado, comenzaban a acosarlo tratando de provocar alguna reacción reveladora.',
				],
				author: {
					nationality: {
						country: 'Argentina',
						flag: 'https://cdn.sanity.io/images/s4dbqkc5/production/ee6f30199738f983516909a0d6330301573a62f6-32x20.png',
					},
					imageUrl:
						'https://cdn.sanity.io/images/s4dbqkc5/production/c91d9010f27d5078ef787cb231395042b66db2cd-400x400.jpg',
					name: 'Alejandro Dolina',
				},
				epigraphs: [],
			},
		},
		{
			order: 59,
			published: true,
			publishingDate: '2022-02-28',
			story: {
				_id: 'd3e73851-32f9-4924-82a3-702588acd4d3',
				approximateReadingTime: 4,
				slug: 'ajedrez',
				title: 'Ajedrez',
				summary:
					'"Ajedrez" (título original "Sjakk") fue publicado originalmente en la obra "Últimas Notas de Thomas F. para la Humanidad", publicada por el autor en 1983. Tomando como protagonista y narrador de los relatos a un viejo misántropo enfrentado al mundo moderno, el autor lleva al extremo su estilo minimalista y austero, marcado por relaciones enigmáticas en lo que parece ser un mundo en una pausa permanente.',
				paragraphs: [
					'El mundo ya no es lo que era. Ahora, por ejemplo, se vive más tiempo. Yo tengo ochenta y muchos, y es poco. Estoy demasiado sano, aunque no tenga razones para estar tan sano. Pero la vida no quiere desprenderse de mí. El que no tiene nada por qué vivir tampoco tiene nada por qué morir.',
					'Tal vez sea ese el motivo.',
				],
				author: {
					nationality: {
						country: 'Noruega',
						flag: 'https://cdn.sanity.io/images/s4dbqkc5/production/3342a975aead11007ee438a8d1acc223d9f2804e-28x20.png',
					},
					imageUrl:
						'https://cdn.sanity.io/images/s4dbqkc5/production/a40ec40510c92f6553bc1da10d7bc9bffc859b35-340x340.jpg',
					name: 'Kjell Askildsen',
				},
				epigraphs: [],
			},
		},
		{
			order: 58,
			published: true,
			publishingDate: '2022-02-27',
			story: {
				_id: '39459afd-062b-4a8b-a6a6-89dde299a324',
				approximateReadingTime: 14,
				slug: 'la-terrible-venganza',
				title: 'La Terrible Venganza',
				summary:
					'"Una Terrible Venganza" (título original "Stráshnaya Mest")<i> </i>es parte de la colección "Veladas en un Caserío de Didanka";  considerada primera gran obra de Gógol. Fue publicada en dos tomos entre 1831 y 1832, siendo los relatos que la componen previamente publicados en diversas revistas de la época. Tomando sus tempranas impresiones y recuerdos de la infancia como contexto para varias de las obras, se evidencian en estos relatos los primeros indicios de elementos que luego serían habituales en la narrativa del autor, destacando especialmente su mezcla particular de lo horroroso y lo humorístico.',
				paragraphs: [
					'En el oscuro sótano de la casa del amo Danilo, y bajo tres candados, yace el brujo preso entre cadenas de hierro; más allá, a orillas del Dnieper, arde su diabólico castillo, y olas rojas como la sangre baten, lamiéndolas, sus viejas murallas. El brujo está encerrado en el profundo sótano no por delito de hechicería ni por sus actos sacrílegos: todo ello que lo juzgue Dios. Él está preso por traición secreta, por ciertos convenios realizados con los enemigos de la tierra rusa y por vender el pueblo ucranio a los polacos y quemar iglesias ortodoxas.',
					'El brujo tiene aspecto sombrío. Sus pensamientos, negros como la noche, se amontonan en su cabeza. Un solo día le queda de vida. Al día siguiente tendrá que despedirse del mundo. Al siguiente lo espera el cadalso. Y no sería una ejecución piadosa: sería un acto de gracia si lo hirvieran vivo en una olla o le arrancaran su pecaminosa piel.',
				],
				author: {
					nationality: {
						country: 'Rusia',
						flag: 'https://cdn.sanity.io/images/s4dbqkc5/production/ea9b5cc3a0f3bb8312b0824cb59780131a216bd1-30x20.png',
					},
					imageUrl:
						'https://cdn.sanity.io/images/s4dbqkc5/production/b2670eebece01f8f8636f16f0cbdfc5f1da02bc3-300x287.jpg',
					name: 'Nikolai Gógol',
				},
				epigraphs: [],
			},
		},
		{
			order: 57,
			published: true,
			publishingDate: '2022-02-26',
			story: {
				_id: '380c0624-4dbb-4ae4-bd18-995d076c9251',
				approximateReadingTime: 5,
				slug: 'las-fresas',
				title: 'Las Fresas',
				summary:
					'"Las Fresas" fue forma parte de la colección "Cuentos a Ninon", una obra temprana de Zola originalmente publicada en 1864. Mediante un estilo naturalista, el autor narra en esta breve historia la tendencia de los jóvenes a despreocuparse de ciertos detalles cuando están enamorados, instalando el bosque como el lugar ideal de los protagonistas como su espacio privado y usando como la frescura como el rasgo común y compartido entre el bosque, las fresas y los amantes mismos.',
				paragraphs: [
					'<b>I.<b>',
					'Una mañana de junio, al abrir la ventana, recibí en el rostro un soplo de aire fresco. Durante la noche había habido una fuerte tormenta. El cielo parecía como nuevo, de un azul tierno, lavado por el chaparrón hasta en sus más pequeños rincones. Los tejados, los árboles cuyas altas ramas percibía por entre las chimeneas, estaban aún empapados de lluvia, y aquel trozo de horizonte sonreía bajo un sol pálido. De los jardines cercanos subía un agradable olor a tierra mojada.',
				],
				author: {
					nationality: {
						country: 'Francia',
						flag: 'https://cdn.sanity.io/images/s4dbqkc5/production/b80876a5f3a89e13acc14254b1f45dd6d29b79f4-30x20.png',
					},
					imageUrl:
						'https://cdn.sanity.io/images/s4dbqkc5/production/354a4a60eebcf20984cd6ff07576b7a32deed162-340x313.jpg',
					name: 'Émile Zola',
				},
				epigraphs: [],
			},
		},
		{
			order: 56,
			published: true,
			publishingDate: '2022-02-25',
			story: {
				_id: '96951ae3-3910-426e-9d3b-fa3eb42027bb',
				approximateReadingTime: 8,
				slug: 'la-casa-de-la-agonia',
				title: 'La Casa de la Agonía',
				summary:
					'"La Casa de la Agonía" (título original "La Casa dell\'Agonia") forma parte del volumen "Cuentos para un Año", publicado póstumamente en 1937. Abarcando una diversidad de temas, estilos y estructuras, a lo largo de más de tres centenas de cuentos, Pirandello buscó que este enorme volumen constara de 365 relatos, uno por cada día del año, siendo truncada la iniciativa por su pronta muerte en 1936 a raíz de una pulmonía; irónicamente como si fuera uno de los personajes de sus relatos.',
				paragraphs: [
					'Sin duda el visitante, al entrar, había dicho su nombre, pero la vieja negra renqueante que había venido a abrirle como una mona con delantal, o no había entendido o lo había olvidado. Así que desde hacía tres cuartos de hora, para toda aquella casa silenciosa él era, ya sin nombre, “un señor que espera ahí”.',
					'“Ahí” quería decir en la sala.',
				],
				author: {
					nationality: {
						country: 'Italia',
						flag: 'https://cdn.sanity.io/images/s4dbqkc5/production/ad1b556cdc0704864c4c85a3646383f81f0d8266-30x20.png',
					},
					imageUrl:
						'https://cdn.sanity.io/images/s4dbqkc5/production/0af12a6a33d2c7e0b7f47e2eb7f157bcc0178eea-340x322.jpg',
					name: 'Luigi Pirandello',
				},
				epigraphs: [],
			},
		},
	],
	slug: 'verano-2022',
	title: 'Cuentos Verano 2022',
};
const upcomingStoriesStorylist = {
	_id: 'de027057-130b-473d-a4f7-f561c878feeb',
	count: 60,
	displayDates: true,
	editionPrefix: 'Día',
	publications: [
		{
			order: 60,
			published: true,
			publishingDate: '2022-03-01',
			story: {
				_id: 'f69c7593-9c3d-4dae-a29c-2de4bf899935',
				approximateReadingTime: 4,
				slug: 'mascaras',
				title: 'Máscaras',
				summary:
					'"Máscaras" está incluido en el volumen "Bar del Infierno", publicado en 2005. La acción de la obra se sucede en un bar del cual no es posible salir, dado que en el universo del libro el afuera no existe. En este escenario, El Narrador de Historias, protagonista principal de esta narración enmarcada, procede a contar una variedad de relatos ubicados en distintos lugares y distintas épocas.',
				paragraphs: [
					'Según cuentan algunos, el corso de la avenida La Plata, en Santos Lugares, era utilizado frecuentemente por ángeles y demonios cuando tenían que cumplir alguna misión terrestre. Solía decirse también que entre todas las máscaras del corso, una era el diablo. Los hechiceros de Lourdes y Villa Lynch aprovechaban aquellas jornadas para suscribir convenios de toda clase con los poderes de las tinieblas. Tras las caretas espeluznantes se ocultaba el verdadero horror de las caras del mal.',
					'Los hombres sensibles de Flores solían pasearse por allí tratando de reconocer el sello de las legiones, o bien gritando frases ingeniosas en el oído de las muchachas. Cada vez que sospechaban el carácter sobrenatural de algún enmascarado, comenzaban a acosarlo tratando de provocar alguna reacción reveladora.',
				],
				author: {
					nationality: {
						country: 'Argentina',
						flag: 'https://cdn.sanity.io/images/s4dbqkc5/production/ee6f30199738f983516909a0d6330301573a62f6-32x20.png',
					},
					imageUrl:
						'https://cdn.sanity.io/images/s4dbqkc5/production/c91d9010f27d5078ef787cb231395042b66db2cd-400x400.jpg',
					name: 'Alejandro Dolina',
				},
				epigraphs: [],
			},
		},
		{
			order: 59,
			published: false,
			publishingDate: '2022-02-28',
			story: {
				_id: 'd3e73851-32f9-4924-82a3-702588acd4d3',
				approximateReadingTime: 4,

				slug: 'ajedrez',
				title: 'Ajedrez',
				summary:
					'"Ajedrez" (título original "Sjakk") fue publicado originalmente en la obra "Últimas Notas de Thomas F. para la Humanidad", publicada por el autor en 1983. Tomando como protagonista y narrador de los relatos a un viejo misántropo enfrentado al mundo moderno, el autor lleva al extremo su estilo minimalista y austero, marcado por relaciones enigmáticas en lo que parece ser un mundo en una pausa permanente.',
				paragraphs: [
					'El mundo ya no es lo que era. Ahora, por ejemplo, se vive más tiempo. Yo tengo ochenta y muchos, y es poco. Estoy demasiado sano, aunque no tenga razones para estar tan sano. Pero la vida no quiere desprenderse de mí. El que no tiene nada por qué vivir tampoco tiene nada por qué morir.',
					'Tal vez sea ese el motivo.',
				],
				author: {
					nationality: {
						country: 'Noruega',
						flag: 'https://cdn.sanity.io/images/s4dbqkc5/production/3342a975aead11007ee438a8d1acc223d9f2804e-28x20.png',
					},
					imageUrl:
						'https://cdn.sanity.io/images/s4dbqkc5/production/a40ec40510c92f6553bc1da10d7bc9bffc859b35-340x340.jpg',
					name: 'Kjell Askildsen',
				},
				epigraphs: [],
			},
		},
		{
			order: 58,
			published: true,
			publishingDate: '2022-02-27',
			story: {
				_id: '39459afd-062b-4a8b-a6a6-89dde299a324',
				approximateReadingTime: 14,
				slug: 'la-terrible-venganza',
				title: 'La Terrible Venganza',
				summary:
					'"Una Terrible Venganza" (título original "Stráshnaya Mest")<i> </i>es parte de la colección "Veladas en un Caserío de Didanka";  considerada primera gran obra de Gógol. Fue publicada en dos tomos entre 1831 y 1832, siendo los relatos que la componen previamente publicados en diversas revistas de la época. Tomando sus tempranas impresiones y recuerdos de la infancia como contexto para varias de las obras, se evidencian en estos relatos los primeros indicios de elementos que luego serían habituales en la narrativa del autor, destacando especialmente su mezcla particular de lo horroroso y lo humorístico.',
				paragraphs: [
					'En el oscuro sótano de la casa del amo Danilo, y bajo tres candados, yace el brujo preso entre cadenas de hierro; más allá, a orillas del Dnieper, arde su diabólico castillo, y olas rojas como la sangre baten, lamiéndolas, sus viejas murallas. El brujo está encerrado en el profundo sótano no por delito de hechicería ni por sus actos sacrílegos: todo ello que lo juzgue Dios. Él está preso por traición secreta, por ciertos convenios realizados con los enemigos de la tierra rusa y por vender el pueblo ucranio a los polacos y quemar iglesias ortodoxas.',
					'El brujo tiene aspecto sombrío. Sus pensamientos, negros como la noche, se amontonan en su cabeza. Un solo día le queda de vida. Al día siguiente tendrá que despedirse del mundo. Al siguiente lo espera el cadalso. Y no sería una ejecución piadosa: sería un acto de gracia si lo hirvieran vivo en una olla o le arrancaran su pecaminosa piel.',
				],
				author: {
					nationality: {
						country: 'Rusia',
						flag: 'https://cdn.sanity.io/images/s4dbqkc5/production/ea9b5cc3a0f3bb8312b0824cb59780131a216bd1-30x20.png',
					},
					imageUrl:
						'https://cdn.sanity.io/images/s4dbqkc5/production/b2670eebece01f8f8636f16f0cbdfc5f1da02bc3-300x287.jpg',
					name: 'Nikolai Gógol',
				},
				epigraphs: [],
			},
		},
		{
			order: 57,
			published: false,
			publishingDate: '2022-02-26',
			story: {
				_id: '380c0624-4dbb-4ae4-bd18-995d076c9251',
				approximateReadingTime: 5,
				slug: 'las-fresas',
				title: 'Las Fresas',
				summary:
					'"Las Fresas" fue forma parte de la colección "Cuentos a Ninon", una obra temprana de Zola originalmente publicada en 1864. Mediante un estilo naturalista, el autor narra en esta breve historia la tendencia de los jóvenes a despreocuparse de ciertos detalles cuando están enamorados, instalando el bosque como el lugar ideal de los protagonistas como su espacio privado y usando como la frescura como el rasgo común y compartido entre el bosque, las fresas y los amantes mismos.',
				paragraphs: [
					'<b>I.<b>',
					'Una mañana de junio, al abrir la ventana, recibí en el rostro un soplo de aire fresco. Durante la noche había habido una fuerte tormenta. El cielo parecía como nuevo, de un azul tierno, lavado por el chaparrón hasta en sus más pequeños rincones. Los tejados, los árboles cuyas altas ramas percibía por entre las chimeneas, estaban aún empapados de lluvia, y aquel trozo de horizonte sonreía bajo un sol pálido. De los jardines cercanos subía un agradable olor a tierra mojada.',
				],
				author: {
					nationality: {
						country: 'Francia',
						flag: 'https://cdn.sanity.io/images/s4dbqkc5/production/b80876a5f3a89e13acc14254b1f45dd6d29b79f4-30x20.png',
					},
					imageUrl:
						'https://cdn.sanity.io/images/s4dbqkc5/production/354a4a60eebcf20984cd6ff07576b7a32deed162-340x313.jpg',
					name: 'Émile Zola',
				},
				epigraphs: [],
			},
		},
		{
			order: 56,
			published: false,
			publishingDate: '2022-02-25',
			story: {
				_id: '96951ae3-3910-426e-9d3b-fa3eb42027bb',
				approximateReadingTime: 8,
				slug: 'la-casa-de-la-agonia',
				title: 'La Casa de la Agonía',
				summary:
					'"La Casa de la Agonía" (título original "La Casa dell\'Agonia") forma parte del volumen "Cuentos para un Año", publicado póstumamente en 1937. Abarcando una diversidad de temas, estilos y estructuras, a lo largo de más de tres centenas de cuentos, Pirandello buscó que este enorme volumen constara de 365 relatos, uno por cada día del año, siendo truncada la iniciativa por su pronta muerte en 1936 a raíz de una pulmonía; irónicamente como si fuera uno de los personajes de sus relatos.',
				paragraphs: [
					'Sin duda el visitante, al entrar, había dicho su nombre, pero la vieja negra renqueante que había venido a abrirle como una mona con delantal, o no había entendido o lo había olvidado. Así que desde hacía tres cuartos de hora, para toda aquella casa silenciosa él era, ya sin nombre, “un señor que espera ahí”.',
					'“Ahí” quería decir en la sala.',
				],
				author: {
					nationality: {
						country: 'Italia',
						flag: 'https://cdn.sanity.io/images/s4dbqkc5/production/ad1b556cdc0704864c4c85a3646383f81f0d8266-30x20.png',
					},
					imageUrl:
						'https://cdn.sanity.io/images/s4dbqkc5/production/0af12a6a33d2c7e0b7f47e2eb7f157bcc0178eea-340x322.jpg',
					name: 'Luigi Pirandello',
				},
				epigraphs: [],
			},
		},
	],
	slug: 'verano-2022',
	title: 'Cuentos Verano 2022',
};

export default {
	title: 'StorylistCardDeckComponent',
	component: StorylistCardDeckComponent,
	decorators: [
		moduleMetadata({
			imports: [RouterTestingModule],
		}),
	],
} as Meta<StorylistCardDeckComponent>;

export const FullyLoaded = {
	render: (args: StorylistCardDeckComponent) => ({
		props: args,
	}),
	args: {
		isLoading: false,
		storylist: fullyLoadedStorylist,
	},
};

export const UpcomingStories = {
	render: (args: StorylistCardDeckComponent) => ({
		props: args,
	}),
	args: {
		isLoading: false,
		storylist: upcomingStoriesStorylist,
	},
};
