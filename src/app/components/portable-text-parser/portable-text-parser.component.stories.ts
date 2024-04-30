import type { Meta, StoryObj } from '@storybook/angular';
import { PortableTextParserComponent } from './portable-text-parser.component';

const meta: Meta<PortableTextParserComponent> = {
	component: PortableTextParserComponent,
	title: 'PortableTextParserComponent',
};
export default meta;
type Story = StoryObj<PortableTextParserComponent>;

export const Primary = {
	render: (args: PortableTextParserComponent) => ({
		props: args,
		template: `
      <div class="grid grid-cols-3 gap-4">
          <cuentoneta-portable-text-parser [classes]="classes" [paragraphs]="paragraphs"/>
    </div>
`,
	}),
	args: {
		classes: 'source-serif-pro-body-xl mb-8 last:mb-0',
		paragraphs: [
			{
				_type: 'block',
				style: 'normal',
				_key: '14edf93b643f',
				markDefs: [],
				children: [
					{
						text: 'JUEVES 26, A LAS 5 DE LA TARDE',
						_key: 'a38bb20057ac',
						_type: 'span',
						marks: ['em'],
					},
				],
			},
			{
				style: 'normal',
				_key: 'fac851921ea3',
				markDefs: [],
				children: [
					{
						_type: 'span',
						marks: [],
						text: "Silvina, Sylvie, Sylvette, te llamé y nadie contestó. Por eso te escribo. Es algo muy simple (“c'est aussi simple comme une phrase musicale”",
						_key: '8ed9da62ad17',
					},
					{
						text: '(1)',
						_key: '3d50df8bb44d',
						_type: 'span',
						marks: ['em', 'strong'],
					},
					{
						text: ') y que puede formularse más o menos así: la habitación se balancea y oscila como un barco. Cuando te llegue esta cartita ya no se moverá más mi cuarto, gracias a vos y un poco gracias a mí, porque te escribo en vez de quedarme “inmoble” (lo descubrí ayer). En suma, quisiera, al final de todo, poder decir como el Poeta:',
						_key: '4e9ad66613f9',
						_type: 'span',
						marks: [],
					},
				],
				_type: 'block',
			},
			{
				style: 'normal',
				_key: '50ae2cbb8108',
				markDefs: [],
				children: [
					{
						_type: 'span',
						marks: [],
						text: "“on n'a pas été des lâcheson a fait ce qu'on a pu”. ",
						_key: '4bf2b2012f88',
					},
					{
						_type: 'span',
						marks: ['em', 'strong'],
						text: '(2)',
						_key: 'f00a0a85ee86',
					},
				],
				_type: 'block',
			},
			{
				children: [
					{
						text: 'Por otra parte, mi cuarto es poco alentador. Ayer, decidida a reparar los daños que me causó la tormenta -la traidora! con lo que me gusta!- arrojé todo o sea libros, discos y cahiers al suelo a fin de ordenar ese conjunto de un modo más inteligente. Como no me animo a regalarte discos (salvo del estilo del de Salónica) me apresuro a contarte que ya se consiguen las piezas para clave de COUPERIN. La clabicembalista (!) se llama ETA HARICH SCHNEIDER. Título general: “Música para clave de Couperin”',
						_key: '138fedf3b9b5',
						_type: 'span',
						marks: [],
					},
				],
				_type: 'block',
				style: 'normal',
				_key: 'f1f15ed57555',
				markDefs: [],
			},
			{
				markDefs: [],
				children: [
					{
						_type: 'span',
						marks: [],
						text: 'Ignoro cómo le caerá a la edipita Edith el nombre de ETA. Además Couperin se asocia con couper ',
						_key: 'cdb2fa1a35c3',
					},
					{
						_type: 'span',
						marks: ['em', 'strong'],
						text: '(3)',
						_key: 'f5d2b648d920',
					},
					{
						_type: 'span',
						marks: [],
						text: ' y Schneider si bien significa sasstre, alude también al verbo cortar.Moraleja: no darle a Edith una tijera de sastre pues no vacilará en cortar el disco en dos partes: le derrière et le devant',
						_key: '6d93af40d7c6',
					},
					{
						text: '(4).',
						_key: '42727a257823',
						_type: 'span',
						marks: ['em', 'strong'],
					},
					{
						_type: 'span',
						marks: [],
						text: ' Le derrière es algo que no se toca sin ser un instrumento. Le devant es algo que se que se que se (se acabó la cinta, oh mi complejo de Persefone, oh mis ganas de Amaltea, etc.).',
						_key: '47035018e342',
					},
				],
				_type: 'block',
				style: 'normal',
				_key: 'a47861f6917d',
			},
			{
				children: [
					{
						_key: '2f1dd0e86157',
						_type: 'span',
						marks: [],
						text: 'Ahora me siento mejor, Sylvette (no habrá ninguna igual) y te bendigo desde el fondo de los fondos de mi casa y de mi raza (de la que me siento desunida, sin embargo los oigo allá lejos cantarme sus ensalmos). Dije ensalmos y el barco se detuvo. Silvina, chérie, escribí mucho: si no lo hacés vos ¿quién lo hará, entonces? Te lo reitero, lo sé; volveré a decirlo, ahora y siempre. Algún día me contarás un cuento con caballos de calesita? “Yo he sufrido tanto.¿Me lo contarás algún día?” Gracias (estoy muy bien)\ny un abrazo matemático de',
					},
					{
						text: '\nA.',
						_key: '395dd1c5c729',
						_type: 'span',
						marks: ['em'],
					},
				],
				_type: 'block',
				style: 'normal',
				_key: 'f0c0f887818a',
				markDefs: [],
			},
			{
				_type: 'block',
				style: 'normal',
				_key: 'aacdba6c6d51',
				markDefs: [],
				children: [
					{
						text: 'P.S.\n',
						_key: '0c67e716f8a1',
						_type: 'span',
						marks: [],
					},
					{
						_type: 'span',
						marks: ['em'],
						text: 'Matemático',
						_key: '2c688ec8e3c9',
					},
					{
						_type: 'span',
						marks: [],
						text: " porque releí el bellísimo “Les nombres d'or”.",
						_key: '967aafd8aa21',
					},
				],
			},
			{
				_type: 'block',
				style: 'normal',
				_key: '020d94ff3809',
				markDefs: [],
				children: [
					{
						_key: 'cb37c348e299',
						_type: 'span',
						marks: [],
						text: 'P.S. (b)\neste jardincito se formó mientras te escribía, S. tan esto y aquello, tan Sylvette y además tan de salir de sí por eso Sylvette “cuaja” (sic mis amigos de Españia) a las maravillas.Jardín de Sylvette a la hora de las maravillas',
					},
				],
			},
			{
				style: 'normal',
				_key: 'fb2ee98522e7',
				markDefs: [],
				children: [
					{
						_type: 'span',
						marks: ['em'],
						text: '* La tarjeta muestra un campo en fondo rojo con flores rosas y naranjas. *',
						_key: '34f9c7173a55',
					},
				],
				_type: 'block',
			},
			{
				_key: '9803c9dd05c8',
				markDefs: [],
				children: [
					{
						_type: 'span',
						marks: ['strong'],
						text: '***',
						_key: 'c2851853c1ab',
					},
				],
				_type: 'block',
				style: 'normal',
			},
			{
				children: [
					{
						_type: 'span',
						marks: ['em', 'strong'],
						text: '(1)',
						_key: 'bb174f4c9e93',
					},
					{
						_type: 'span',
						marks: [],
						text: '. “Es tan simple como una frase musical”.\n',
						_key: 'b76a46097b2c',
					},
					{
						_key: 'd69fc76ebb0e',
						_type: 'span',
						marks: ['strong', 'em'],
						text: '(2)',
					},
					{
						text: '. “No hemos sido cobardes Hemos hecho lo que pudimos.”\n',
						_key: '01c5f324a5e1',
						_type: 'span',
						marks: [],
					},
					{
						_type: 'span',
						marks: ['em', 'strong'],
						text: '(3)',
						_key: '349b08c5c32e',
					},
					{
						_type: 'span',
						marks: [],
						text: '. “Cortar”\n',
						_key: '0be1be4c0ccd',
					},
					{
						text: '(4)',
						_key: '28e442ab4c5b',
						_type: 'span',
						marks: ['em', 'strong'],
					},
					{
						text: '. “El trasero y el frente”.',
						_key: '69b9e9f0f655',
						_type: 'span',
						marks: [],
					},
				],
				_type: 'block',
				style: 'normal',
				_key: 'f982443e3cbb',
				markDefs: [],
			},
		],
	},
};

export const Summary = {
	render: (args: PortableTextParserComponent) => ({
		props: args,
		template: `
      <div class="grid grid-cols-3 gap-4">
          <cuentoneta-portable-text-parser [classes]="classes" [paragraphs]="paragraphs"/>
    </div>
`,
	}),
	args: {
		classes: 'mb-4 last:mb-0',
		paragraphs: [
			{
				children: [
					{
						marks: ['strong', 'em'],
						text: '¿Quién Sabe?',
						_key: 'f83599c71483',
						_type: 'span',
					},
					{
						_type: 'span',
						marks: [],
						text: ' (título original ',
						_key: 'b813ac7b89c7',
					},
					{
						_type: 'span',
						marks: ['em'],
						text: 'Qui Sait?',
						_key: '4cb337ec4dec',
					},
					{
						_key: '22ba989c1cc2',
						_type: 'span',
						marks: [],
						text: ') fue publicado originalmente en la edición del 6 de abril de 1890 del periódico francés ',
					},
					{
						text: "L'Echo de Paris",
						_key: '18eebbae1cae',
						_type: 'span',
						marks: ['em'],
					},
					{
						_type: 'span',
						marks: [],
						text: ' y posteriormente como parte de la colección de relatos ',
						_key: '834583a7b72d',
					},
					{
						marks: ['em'],
						text: 'La Belleza Inútil',
						_key: 'c84775db5686',
						_type: 'span',
					},
					{
						_key: '5d7391f9b547',
						_type: 'span',
						marks: [],
						text: ', editada aquel mismo año.',
					},
				],
				_type: 'block',
				style: 'normal',
				_key: '4c94bc6a92a3',
				markDefs: [],
			},
			{
				children: [
					{
						_type: 'span',
						marks: [],
						text: 'Créditos a ',
						_key: '09e7167e6079',
					},
					{
						_type: 'span',
						marks: ['em', '56fb7dd837a3'],
						text: 'setogenico',
						_key: '0920cdcab931',
					},
					{
						_type: 'span',
						marks: ['em'],
						text: ' ',
						_key: 'cebe6118c6f1',
					},
					{
						_type: 'span',
						marks: [],
						text: 'por el relato del cuento disponible en su canal de YouTube.',
						_key: '2a42216ff69b',
					},
				],
				_type: 'block',
				style: 'normal',
				_key: '7b444b26bc54',
				markDefs: [
					{
						_type: 'link',
						href: 'https://www.youtube.com/@setogenico',
						_key: '56fb7dd837a3',
					},
				],
			},
		],
	},
};
