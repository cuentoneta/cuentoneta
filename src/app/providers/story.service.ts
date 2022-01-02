import { Injectable } from '@angular/core';
import { StoryModel } from '../models/story.model';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StoryService {
    private stories: StoryModel[] = [
        {
            id: 2,
            author: {
                id: 2,
                name: 'Liliana Bodoc',
                nationality:
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_Argentina.svg/2560px-Flag_of_Argentina.svg.png',
                biography: [
                    '(Santa Fe, 1958 - Mendoza, 2018). Liliana Bodoc fue una escritora y poeta argentina especializada en literatura juvenil e infantil. Estudió letras en la Universidad de Cuyo, desempeñándose allí como docente. Su obra en prosa más famosa es la trilogía de la "Saga de los Confines"',
                ],
                fullBioUrl: 'https://www.biografias.es/famosos/liliana-bodoc.html',
                imgString: 'https://i.ibb.co/bbK5JMM/Liliana-Bodoc.jpg',
            },
            title: 'Amigos por el Viento',
            day: 2,
            prologues: [],
            summary: [
                '"Amigos en el Viento" es parte de la colección de cuentos homónima, la cual consta de 7 relatos que abordan las pérdidas, los conflictos propios de la adolescencia y los efectos, a veces impensados, que tiene enamorarse. Fue publicado en 2011',
            ],
            paragraphs: [
                'A veces, la vida se comparta como el viento: desordena y arrasa. Algo susurra, pero no se Ie entiende. A su paso todo peligra; hasta aquello que tiene raíces. Los edificios, por ejemplo. O las costumbres cotidianas.',
                'Cuando la vida se comporta de ese modo, se nos ensucian los ojos con los que vemos. Es decir, los verdaderos ojos. A nuestro lado, pasan papeles escritos con una letra que creemos reconocer. EI cielo se mueve más rápido que las horas. Y lo peor es que nadie sabe si, alguna vez, regresará la calma.',
                'Así ocurrió el día que papá se fue de casa. La vida se nos transformó en viento casi sin dar aviso. Recuerdo la puerta que se cerró detrás de su sombra y sus valijas. También puedo recordar la ropa reseca sacudiéndose al sol mientras mamá cerraba las ventanas para que, adentro y adentro, algo quedara en su sitio.',
                '-Le dije a Ricardo que viniera con su hijo. ¿Qué te parece?',
                '-Me parece bien -mentí.',
                'Mama dejó de pulir la bandeja, y me miró:',
                '-No me lo estás diciendo muy convencida',
                '-Yo no tengo que estar convencida.',
                '-¿Y eso que significa? -preguntó la mujer que más preguntas me hizo a lo largo de mi vida.',
                'Me vi obligada a levantar los ojos del libro:',
                '-Significa que es tu cumpleaños, y no el mío -respondí.',
                'La gata salió de su canasto, y fue a enredarse entre las piernas de mamá.',
                'Que mamá tuviera novio era casi insoportable. Pero que ese novio tuviera un hijo era una verdadera amenaza. Otra vez, un peligro rondaba mi vida. Otra vez había viento en el horizonte.',
                '-Se van a entender bien -dijo mamá-. Juanjo tiene tu edad.',
                'La gata, único ser que entendía mi desolación, salta sabre mis rodillas. Gracias, gatita buena.',
                'Habían pasado varios años desde aquel viento que se Ilevó a papá. En casa ya estaban reparados los daños. Los huecos de la biblioteca fueron ocupados con nuevos libros. Y hacía mucho que yo no encontraba gotas de Ilanto escondidas en los jarrones, disimuladas como estalactitas en el congelador. Disfrazadas de pedacitos de cristal. "Se me acaba de romper una copa ", inventaba mamá que, con tal de ocultarme su tristeza, era capaz de esas y otras asombrosas hechicerías.',
                'Ya no había huellas de viento ni de Ilantos. Y justo cuando empezábamos a reírnos con ganas y a pasear juntas en bicicleta, aparecía un tal Ricardo y todo volvía a peligrar.',
                'Mamá sacó las cocadas del horno. Antes del viento, ella las hacía cada domingo. Después pareció tomarle rencor a la receta, porque se molestaba con la sola mención del asunto. Ahora, el tal Ricardo y su Juanjo habían conseguido que volviera a hacerlas. Algo que yo no pude conseguir.',
                '-Me voy a arreglar un poco -dijo mamá, mirándose las manos-. Lo único que falta es que lIeguen y me encuentren hecha un desastre.',
                '-¿Qué te vas a poner? -Ie pregunté, en un supremo esfuerzo de amor.',
                '-EI vestido azul. Mamá salió de la cocina, la gata regresó a su canasta. Y yo me quedé sola para imaginar lo que me esperaba.',
                'Seguramente, ese horrible Juanjo iba a devorar las cocadas. Y los pedacitos de merengue se quedarían pegados en los costados de su boca. También era seguro que iba a dejar sucio el jabón cuando se lavara las manos. Iba a hablar de su perro con el único propósito de desmerecer a mi gata.',
                'Pude verlo transitando por mi casa con los cordones de las zapatillas desatados, tratando de anticipar la manera de quedarse con mi dormitorio. Pero, más que ninguna otra cosa, me aterró la certeza de que sería uno de esos chicos que, en vez de hablar, hacen ruidos: frenadas de autos, golpes en el estómago, sirenas de bomberos, ametralladoras y explosiones.',
                '-¡Mama! - grité, pegada a la puerta del baño.',
                '-¿Qué pasa? -me respondió desde la ducha.',
                '-¿Cómo se lIaman esas palabras que parecen ruidos?',
                'EI agua caía apenas tibia, mamá intentaba comprender mi pregunta, la gata dormía y yo esperaba.',
                '-¿Palabras que parecen ruidos? -repitió.',
                '-Sí -y aclaré-: Pum, Plal, Ugg...',
                'iRing!',
                '-Por favor -dijo mamá-, están lIamando.',
                'No tuve más remedio que abrir la puerta.',
                '-¡Holal -dijo Ricardo, asomado detrás de las rosas.',
                'Yo miré a su hijo sin piedad. Como lo había imaginado, traía puesta una remera ridícula y un pantalón que Ie quedaba corto.',
                'Enseguida, apareció mamá. Estaba tan linda como si no se hubiese arreglado. Así Ie pasaba a ella. Y el azul Ie quedaba muy bien a sus cejas espesas.',
                '-Podrían ir a escuchar música a tu habitación - sugirió la mujer que cumplía años, desesperada por la falta de aire.',
                'Y es que yo me lo había tragado todo para matar por asfixia a los invitados.',
                'Cumplí sin quejarme. EI horrible chico me siguió en silencio. Me senté en una cama. EI se sentó en la otra. Sin duda, ya estaría decidiendo que el dormitorio pronto sería de su propiedad. Y que yo dormiría en el canasto, junto a la gata.',
                'No puse música porque no tenía nada que festejar. Aquel era un día triste para mí. No me pareció justo, y decidí que también el debía sufrir. Entonces, busqué una espina y la puse entre signos de pregunta:',
                '-¿Cuánto hace que se murió tu mamá?',
                'Juanjo abrió grandes los ojos para disimular algo.',
                '-Cuatro años -contesto.',
                'Pero mi rabia no se conformó con eso:',
                '-¿Y cómo fue? -volví a preguntar.',
                'Esta vez, entrecerró los ojos.',
                'Yo esperaba oír cualquier respuesta, menos la que lIegó desde su voz cortada.',
                '-Fue..., fue como un viento -dijo.',
                'Agaché la cabeza, y dejé salir el aire que tenía guardado. Juanjo estaba hablando del viento, ¿sería el mismo que pasó por mi vida?',
                '-¿Es un viento que lIega de repente y se mete en todos lados? -pregunte.',
                '-Sí, es ese.',
                '-¿Y también susurra...?',
                '-Mi viento susurraba -dijo Juanjo-. Pero no entendí lo que decía.',
                '-Yo tampoco entendí.',
                'Los dos vientos se mezclaron en mi cabeza.',
                'Pasó un silencio.',
                '-Un viento tan fuerte que movió los edificios -dijo él-. Y eso que los edificios tienen raíces...',
                'Pasó una respiración.',
                '-A mí se me ensuciaron los ojos -dije.',
                'Pasaron dos.',
                '-A mi también.',
                '-¿Tu papá cerró las ventanas? -pregunté.',
                '-Sí.',
                '-Mi mamá también.',
                '-¿Por qué lo habrán hecho? -Juanjo parecía asustado.',
                '-Debe haber sido para que algo quedara en su sitio.',
                'A veces, la vida se comporta como el viento: desordena y arrasa. Algo susurra, pero no se Ie entiende. A su paso todo peligra; hasta aquello que tiene raíces. Los edificios, por ejemplo. O las costumbres cotidianas.',
                '-Si querés vamos a comer cocadas -Ie dije.',
                'Porque Juanjo y yo teníamos un viento en común. Y quizás ya era tiempo de abrir las ventanas. ',
            ],
        },
        {
            id: 1,
            author: {
                id: 1,
                name: 'Horacio Quiroga',
                nationality:
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Uruguay.svg/2560px-Flag_of_Uruguay.svg.png',
                biography: [
                    '(Salto, 1878 - Buenos Aires, 1937). Narrador uruguayo radicado en Argentina. Se lo considera uno los maestros del cuento latinoamericano, de prosa vívida, naturalista y modernista. Sus relatos a menudo retratan a la naturaleza bajo rasgos temibles y horrorosos, como enemiga de las circunstancias del ser humano.',
                ],
                fullBioUrl: 'https://www.biografiasyvidas.com/biografia/q/quiroga_horacio.html',
                imgString:
                    'https://cloudfront-us-east-1.images.arcpublishing.com/infobae/RD4B5FA2EZECNBZ6UXMRQOL66A.jpg',
            },
            title: 'A La Deriva',
            day: 1,
            prologues: [],
            summary: [
                '"A La Deriva" es parte de la obra "Cuentos de amor de locura y de muerte", publicada en 1917. Esta colección cuenta con 18 relatos, entre los que también se incluyen los clásicos "El almohadón de plumas" y "La gallina degollada".',
            ],
            paragraphs: [
                'El hombre pisó algo blanduzco, y en seguida sintió la mordedura en el pie. Saltó \n' +
                    'adelante, y al volverse con un juramento vio una yararacusú que arrollada sobre sí \n' +
                    'misma esperaba otro ataque.',
                'El hombre echó una veloz ojeada a su pie, donde dos gotitas de sangre engrosaban \n' +
                    'dificultosamente, y sacó el machete de la cintura. La víbora vio la amenaza, y \n' +
                    'hundió más la cabeza en el centro mismo de su espiral; pero el machete cayó de \n' +
                    'lomo, dislocándole las vértebras.',
                'El hombre se bajó hasta la mordedura, quitó las gotitas de sangre, y durante un \n' +
                    'instante contempló. Un dolor agudo nacía de los dos puntitos violetas, y \n' +
                    'comenzaba a invadir todo el pie. Apresuradamente se ligó el tobillo con su pañuelo \n' +
                    'y siguió por la picada hacia su rancho \n' +
                    'El dolor en el pie aumentaba, con sensación de tirante abultamiento, y de pronto el \n' +
                    'hombre sintió dos o tres fulgurantes puntadas que como relámpagos habían \n' +
                    'irradiado desde la herida hasta la mitad de la pantorrilla. Movía la pierna con \n' +
                    'dificultad; una metálica sequedad de garganta, seguida de sed quemante, le arrancó \n' +
                    'un nuevo juramento.',
                'Llegó por fin al rancho, y se echó de brazos sobre la rueda de un trapiche. Los dos \n' +
                    'puntitos violeta desaparecían ahora en la monstruosa hinchazón del pie entero. La \n' +
                    'piel parecía adelgazada y a punto de ceder, de tensa. Quiso llamar a su mujer, y la \n' +
                    'voz se quebró en un ronco arrastre de garganta reseca. La sed lo devoraba.',
                '—¡Dorotea! —alcanzó a lanzar en un estertor—. ¡Dame caña! \n' +
                    'Su mujer corrió con un vaso lleno, que el hombre sorbió en tres tragos. Pero no \n' +
                    'había sentido gusto alguno. \n' +
                    '—¡Te pedí caña, no agua! —rugió de nuevo. ¡Dame caña! \n' +
                    '—¡Pero es caña, Paulino! —protestó la mujer espantada. \n' +
                    '—¡No, me diste agua! ¡Quiero caña, te digo! \n' +
                    'La mujer corrió otra vez, volviendo con la damajuana. El hombre tragó uno tras \n' +
                    'otro dos vasos, pero no sintió nada en la garganta.\n' +
                    '—Bueno; esto se pone feo —murmuró entonces, mirando su pie lívido y ya con \n' +
                    'lustre gangrenoso. Sobre la honda ligadura del pañuelo, la carne desbordaba como \n' +
                    'una monstruosa morcilla. ',
                'Los dolores fulgurantes se sucedían en continuos relampagueos, y llegaban ahora a \n' +
                    'la ingle. La atroz sequedad de garganta que el aliento parecía caldear más, \n' +
                    'aumentaba a la par. Cuando pretendió incorporarse, un fulminante vómito lo \n' +
                    'mantuvo medio minuto con la frente apoyada en la rueda de palo. \n' +
                    'Pero el hombre no quería morir, y descendiendo hasta la costa subió a su canoa. \n' +
                    'Sentóse en la popa y comenzó a palear hasta el centro del Paraná. Allí la corriente \n' +
                    'del río, que en las inmediaciones del Iguazú corre seis millas, lo llevaría antes de \n' +
                    'cinco horas a Tacurú-Pucú. ',
                'El hombre, con sombría energía, pudo efectivamente llegar hasta el medio del río; \n' +
                    'pero allí sus manos dormidas dejaron caer la pala en la canoa, y tras un nuevo \n' +
                    'vómito —de sangre esta vez—dirigió una mirada al sol que ya trasponía el monte. \n' +
                    'La pierna entera, hasta medio muslo, era ya un bloque deforme y durísimo que \n' +
                    'reventaba la ropa. El hombre cortó la ligadura y abrió el pantalón con su cuchillo: \n' +
                    'el bajo vientre desbordó hinchado, con grandes manchas lívidas y terriblemente \n' +
                    'doloroso. El hombre pensó que no podría jamás llegar él solo a Tacurú-Pucú, y se \n' +
                    'decidió a pedir ayuda a su compadre Alves, aunque hacía mucho tiempo que \n' +
                    'estaban disgustados.',
                'La corriente del río se precipitaba ahora hacia la costa brasileña, y el hombre pudo \n' +
                    'fácilmente atracar. Se arrastró por la picada en cuesta arriba, pero a los veinte \n' +
                    'metros, exhausto, quedó tendido de pecho. \n' +
                    '—¡Alves! —gritó con cuanta fuerza pudo; y prestó oído en vano. \n' +
                    '—¡Compadre Alves! ¡No me niegue este favor! —clamó de nuevo, alzando la \n' +
                    'cabeza del suelo. En el silencio de la selva no se oyó un solo rumor. El hombre \n' +
                    'tuvo aún valor para llegar hasta su canoa, y la corriente, cogiéndola de nuevo, la \n' +
                    'llevó velozmente a la deriva.',
                'El Paraná corre allí en el fondo de una inmensa hoya, cuyas paredes, altas de cien \n' +
                    'metros, encajonan fúnebremente el río. Desde las orillas bordeadas de negros \n' +
                    'bloques de basalto, asciende el bosque, negro también. Adelante, a los costados, \n' +
                    'detrás, la eterna muralla lúgubre, en cuyo fondo el río arremolinado se precipita en \n' +
                    'incesantes borbollones de agua fangosa. El paisaje es agresivo, y reina en él un \n' +
                    'silencio de muerte. Al atardecer, sin embargo, su belleza sombría y calma cobra \n' +
                    'una majestad única.',
                'El sol había caído ya cuando el hombre, semitendido en el fondo de la canoa, tuvo \n' +
                    'un violento escalofrío. Y de pronto, con asombro, enderezó pesadamente la cabeza: \n' +
                    'se sentía mejor. La pierna le dolía apenas, la sed disminuía, y su pecho, libre ya, se \n' +
                    'abría en lenta inspiración. \n' +
                    'El veneno comenzaba a irse, no había duda. Se hallaba casi bien, y aunque no tenía \n' +
                    'fuerzas para mover la mano, contaba con la caída del rocío para reponerse del todo. \n' +
                    'Calculó que antes de tres horas estaría en Tacurú-Pucú. \n' +
                    'El bienestar avanzaba, y con él una somnolencia llena de recuerdos. No sentía ya \n' +
                    'nada ni en la pierna ni en el vientre. ¿Viviría aún su compadre Gaona en Tacurú-Pucú? Acaso viera también a su ex patrón mister Dougald, y al recibidor del \n' +
                    'obraje',
                '¿Llegaría pronto? El cielo, al poniente, se abría ahora en pantalla de oro, y el río se \n' +
                    'había coloreado también. Desde la costa paraguaya, ya entenebrecida, el monte \n' +
                    'dejaba caer sobre el río su frescura crepuscular, en penetrantes efluvios de azahar y \n' +
                    'miel silvestre. Una pareja de guacamayos cruzó muy alto y en silencio hacia el \n' +
                    'Paraguay. \n' +
                    'Allá abajo, sobre el río de oro, la canoa derivaba velozmente, girando a ratos sobre \n' +
                    'sí misma ante el borbollón de un remolino. El hombre que iba en ella se sentía cada \n' +
                    'vez mejor, y pensaba entretanto en el tiempo justo que había pasado sin ver a su ex \n' +
                    'patrón Dougald. ¿Tres años? Tal vez no, no tanto. ¿Dos años y nueve meses? \n' +
                    'Acaso. ¿Ocho meses y medio? Eso sí, seguramente. ',
                'De pronto sintió que estaba helado hasta el pecho. ¿Qué sería? Y la respiración \n' +
                    'también... \n' +
                    'Al recibidor de maderas de mister Dougald, Lorenzo Cubilla, lo había conocido en \n' +
                    'Puerto Esperanza un viernes santo... ¿Viernes? Sí, o jueves . . . \n' +
                    'El hombre estiró lentamente los dedos de la mano. \n' +
                    '—Un jueves... \n' +
                    'Y cesó de respirar.',
            ],
        },
    ];

    getCount(): number {
        return this.stories.length;
    }

    getAll() {
        return of(this.stories);
    }

    get(day: number): Observable<StoryModel> {
        return of(this.stories.filter((story) => story.day === day).pop());
    }
}
