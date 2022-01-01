import { Injectable } from "@angular/core";
import { StoryModel } from "../models/story.model";
import { Observable, of } from "rxjs";

@Injectable({ providedIn: "root" })
export class StoryService {
  private stories: StoryModel[] = [
    {
      id: 1,
      author: {
        id: 1,
        name: "Horacio Quiroga",
        nationality: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Flag_of_Uruguay.svg/2560px-Flag_of_Uruguay.svg.png",
        biography: [],
        imgString: 'https://cloudfront-us-east-1.images.arcpublishing.com/infobae/RD4B5FA2EZECNBZ6UXMRQOL66A.jpg'
      },
      title: "A La Deriva",
      day: 1,
      prologues: [],
      summary: [],
      paragraphs: [
        "El hombre pisó algo blanduzco, y en seguida sintió la mordedura en el pie. Saltó \n" +
          "adelante, y al volverse con un juramento vio una yararacusú que arrollada sobre sí \n" +
          "misma esperaba otro ataque.",
        "El hombre echó una veloz ojeada a su pie, donde dos gotitas de sangre engrosaban \n" +
          "dificultosamente, y sacó el machete de la cintura. La víbora vio la amenaza, y \n" +
          "hundió más la cabeza en el centro mismo de su espiral; pero el machete cayó de \n" +
          "lomo, dislocándole las vértebras.",
        "El hombre se bajó hasta la mordedura, quitó las gotitas de sangre, y durante un \n" +
          "instante contempló. Un dolor agudo nacía de los dos puntitos violetas, y \n" +
          "comenzaba a invadir todo el pie. Apresuradamente se ligó el tobillo con su pañuelo \n" +
          "y siguió por la picada hacia su rancho \n" +
          "El dolor en el pie aumentaba, con sensación de tirante abultamiento, y de pronto el \n" +
          "hombre sintió dos o tres fulgurantes puntadas que como relámpagos habían \n" +
          "irradiado desde la herida hasta la mitad de la pantorrilla. Movía la pierna con \n" +
          "dificultad; una metálica sequedad de garganta, seguida de sed quemante, le arrancó \n" +
          "un nuevo juramento.",
        "Llegó por fin al rancho, y se echó de brazos sobre la rueda de un trapiche. Los dos \n" +
          "puntitos violeta desaparecían ahora en la monstruosa hinchazón del pie entero. La \n" +
          "piel parecía adelgazada y a punto de ceder, de tensa. Quiso llamar a su mujer, y la \n" +
          "voz se quebró en un ronco arrastre de garganta reseca. La sed lo devoraba.",
        "—¡Dorotea! —alcanzó a lanzar en un estertor—. ¡Dame caña! \n" +
          "Su mujer corrió con un vaso lleno, que el hombre sorbió en tres tragos. Pero no \n" +
          "había sentido gusto alguno. \n" +
          "—¡Te pedí caña, no agua! —rugió de nuevo. ¡Dame caña! \n" +
          "—¡Pero es caña, Paulino! —protestó la mujer espantada. \n" +
          "—¡No, me diste agua! ¡Quiero caña, te digo! \n" +
          "La mujer corrió otra vez, volviendo con la damajuana. El hombre tragó uno tras \n" +
          "otro dos vasos, pero no sintió nada en la garganta.\n" +
          "—Bueno; esto se pone feo —murmuró entonces, mirando su pie lívido y ya con \n" +
          "lustre gangrenoso. Sobre la honda ligadura del pañuelo, la carne desbordaba como \n" +
          "una monstruosa morcilla. ",
        "Los dolores fulgurantes se sucedían en continuos relampagueos, y llegaban ahora a \n" +
          "la ingle. La atroz sequedad de garganta que el aliento parecía caldear más, \n" +
          "aumentaba a la par. Cuando pretendió incorporarse, un fulminante vómito lo \n" +
          "mantuvo medio minuto con la frente apoyada en la rueda de palo. \n" +
          "Pero el hombre no quería morir, y descendiendo hasta la costa subió a su canoa. \n" +
          "Sentóse en la popa y comenzó a palear hasta el centro del Paraná. Allí la corriente \n" +
          "del río, que en las inmediaciones del Iguazú corre seis millas, lo llevaría antes de \n" +
          "cinco horas a Tacurú-Pucú. ",
        "El hombre, con sombría energía, pudo efectivamente llegar hasta el medio del río; \n" +
          "pero allí sus manos dormidas dejaron caer la pala en la canoa, y tras un nuevo \n" +
          "vómito —de sangre esta vez—dirigió una mirada al sol que ya trasponía el monte. \n" +
          "La pierna entera, hasta medio muslo, era ya un bloque deforme y durísimo que \n" +
          "reventaba la ropa. El hombre cortó la ligadura y abrió el pantalón con su cuchillo: \n" +
          "el bajo vientre desbordó hinchado, con grandes manchas lívidas y terriblemente \n" +
          "doloroso. El hombre pensó que no podría jamás llegar él solo a Tacurú-Pucú, y se \n" +
          "decidió a pedir ayuda a su compadre Alves, aunque hacía mucho tiempo que \n" +
          "estaban disgustados.",
        "La corriente del río se precipitaba ahora hacia la costa brasileña, y el hombre pudo \n" +
          "fácilmente atracar. Se arrastró por la picada en cuesta arriba, pero a los veinte \n" +
          "metros, exhausto, quedó tendido de pecho. \n" +
          "—¡Alves! —gritó con cuanta fuerza pudo; y prestó oído en vano. \n" +
          "—¡Compadre Alves! ¡No me niegue este favor! —clamó de nuevo, alzando la \n" +
          "cabeza del suelo. En el silencio de la selva no se oyó un solo rumor. El hombre \n" +
          "tuvo aún valor para llegar hasta su canoa, y la corriente, cogiéndola de nuevo, la \n" +
          "llevó velozmente a la deriva.",
        "El Paraná corre allí en el fondo de una inmensa hoya, cuyas paredes, altas de cien \n" +
          "metros, encajonan fúnebremente el río. Desde las orillas bordeadas de negros \n" +
          "bloques de basalto, asciende el bosque, negro también. Adelante, a los costados, \n" +
          "detrás, la eterna muralla lúgubre, en cuyo fondo el río arremolinado se precipita en \n" +
          "incesantes borbollones de agua fangosa. El paisaje es agresivo, y reina en él un \n" +
          "silencio de muerte. Al atardecer, sin embargo, su belleza sombría y calma cobra \n" +
          "una majestad única.",
        "El sol había caído ya cuando el hombre, semitendido en el fondo de la canoa, tuvo \n" +
          "un violento escalofrío. Y de pronto, con asombro, enderezó pesadamente la cabeza: \n" +
          "se sentía mejor. La pierna le dolía apenas, la sed disminuía, y su pecho, libre ya, se \n" +
          "abría en lenta inspiración. \n" +
          "El veneno comenzaba a irse, no había duda. Se hallaba casi bien, y aunque no tenía \n" +
          "fuerzas para mover la mano, contaba con la caída del rocío para reponerse del todo. \n" +
          "Calculó que antes de tres horas estaría en Tacurú-Pucú. \n" +
          "El bienestar avanzaba, y con él una somnolencia llena de recuerdos. No sentía ya \n" +
          "nada ni en la pierna ni en el vientre. ¿Viviría aún su compadre Gaona en TacurúPucú? Acaso viera también a su ex patrón mister Dougald, y al recibidor del \n" +
          "obraje",
        "¿Llegaría pronto? El cielo, al poniente, se abría ahora en pantalla de oro, y el río se \n" +
          "había coloreado también. Desde la costa paraguaya, ya entenebrecida, el monte \n" +
          "dejaba caer sobre el río su frescura crepuscular, en penetrantes efluvios de azahar y \n" +
          "miel silvestre. Una pareja de guacamayos cruzó muy alto y en silencio hacia el \n" +
          "Paraguay. \n" +
          "Allá abajo, sobre el río de oro, la canoa derivaba velozmente, girando a ratos sobre \n" +
          "sí misma ante el borbollón de un remolino. El hombre que iba en ella se sentía cada \n" +
          "vez mejor, y pensaba entretanto en el tiempo justo que había pasado sin ver a su ex \n" +
          "patrón Dougald. ¿Tres años? Tal vez no, no tanto. ¿Dos años y nueve meses? \n" +
          "Acaso. ¿Ocho meses y medio? Eso sí, seguramente. ",
        "De pronto sintió que estaba helado hasta el pecho. ¿Qué sería? Y la respiración \n" +
          "también... \n" +
          "Al recibidor de maderas de mister Dougald, Lorenzo Cubilla, lo había conocido en \n" +
          "Puerto Esperanza un viernes santo... ¿Viernes? Sí, o jueves . . . \n" +
          "El hombre estiró lentamente los dedos de la mano. \n" +
          "—Un jueves... \n" +
          "Y cesó de respirar.",
      ],
    },
  ];

  getAll() {
    return of(this.stories);
  }

  get(day: number): Observable<StoryModel> {
    return of(this.stories.filter((story) => story.day === day).pop());
  }
}
