# La Cuentoneta

![image](https://user-images.githubusercontent.com/32349705/162515396-e6a330ae-0eeb-426f-83c3-e00df240c962.png)

"La Cuentoneta" es una aplicación web que permite el almacenamiento, indexación y lectura digital de relatos breves, proveyendo la infraestructura digital necesaria para llevar adelante una lectura colectiva diaria de textos, más el envío de notificaciones a personas interesadas en participar de la iniciativa.

La aplicación fue desarrollada y utilizada durante la primera edición de la iniciativa "Cuentos de Verano" (disponible en https://cuentosdeverano.ar). Esta iniciativa busca fomentar la lectura y compartir relatos breves en el ámbito digital mediante la publicación de un cuento por día en habla española durante la temporada estival del hemisferio sur. A lo largo de la iniciativa, La Cuentoneta fue usada como soporte digital de lectura para proveer a nuestros lectores de cada uno de los 60 cuentos que fueron publicados durante el 1° de enero y el 1° de marzo de 2022.

## ¿Cómo usar este repositorio?

1. Instalá Ionic y Vercel como dependencias globales vía npm
```bash
npm i @ionic/cli vercel -g
```
2. Cloná este repositorio y posate en el directorio principal 
```bash
$ git clone https://github.com/rolivencia/cuentoneta tu-proyecto
$ cd tu-proyecto
```
3. Instalá las dependencias mediante npm install
```bash
npm install
```
4. Generá un archivo .env con las variables de entorno requeridas
```
SANITY_PROJECT_ID=XXXXXXXXXXXXXXXXXXXXXXXXX
SANITY_DATASET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
ONESIGNAL_APP_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
5. Lanzá la aplicación en modo desarrollador
```bash
vercel dev
```
6. El directorio /cms contiene la información relativa al proyecto de Sanity, entre la que se incluye el schema utilizado. Para utilizar Sanity, debe primero instalarse su CLI como dependencia global y posteriormente ejecutar Sanity Studio localmente
```bash
npm i -g @sanity/cli
sanity start
```


## Stack Tecnológico

### Proyecto Base
* [ionic-conference-app](https://github.com/ionic-team/ionic-conference-app) - Aplicación starter de Ionic Framework
### Frontend
* [Ionic Framework](https://github.com/ionic-team/ionic-framework) - Framework para el desarrollo de aplicaciones híbridas.
### Backend + Infraestructura
* [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions) - API Endpoints implementados con Serverless functions en JavaScript
* [dotenv](https://github.com/motdotla/dotenv) - Para manejo de variables de entorno en el ambiente de desarrollo
### Orígenes de Datos
* [Sanity CMS](https://www.sanity.io/) - Almacenamiento de la información relativa a autores y textos disponibles para lectura en la plataforma.
### Envío de notificaciones
* [OneSignal](https://onesignal.com/) - Servicio para envío de notificaciones web push

## Autores
### Aplicación
* Ramiro Olivencia - Programación
* Juan Blas Tschopp - Programación
* Candela Godoy - QA

### Idea
* Facundo Kaufmann - Idea original
* Ramiro Olivencia - Idea original

### Colaboradores
* Juan Balmaceda - Investigación y publicación de cuentos
* Patricio Decoud - Investigación y publicación de cuentos

### Medios de terceros
- Dominik S por ícono de megáfono utilizado en la aplicación: https://www.pngitem.com/middle/ihhTThJ_announce-icon-png-white-png-download-announce-white/
- Tell a Story por imagen de minivan con libros: https://cronicasdeimarie.com/2017/03/09/librerias-fantasticas-del-mundo-libros-sobre-ruedas/ 
