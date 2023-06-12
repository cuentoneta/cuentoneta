/**
 * Script para generar el archivo de environment utilizado por Angular.
 * Este script debe ejecutarse como paso previo a la compilación de la aplicación
 * (build step).
 *
 * Para mejorar los tiempos de carga del paint inicial de la aplicación, la con-
 * figuración de contenido se obtiene desde las variables de entorno y se deposita
 * en el archivo de environment.ts, el cual es compilado junto con la aplicación.
 *
 * Autor: @rolivencia
 */

// Importar cliente de Sanity
import { client } from '../src/api/_helpers/sanity-connector';

// Interfaces
import { StorylistDeckConfig } from '../src/app/models/content.model';

// NodeJS & env
import { writeFile, existsSync, mkdirSync } from 'fs';
import * as dotenv from 'dotenv';
import ErrnoException = NodeJS.ErrnoException;

// Tipo que describe los diferentes tipos de ambientes en los que puede ejecutarse el presente script
type TEnvironmentType = 'development' | 'preview' | 'staging' | 'production';

// Leer variables de entorno desde .env
dotenv.config();

const dirPath: string = `src/app/environments`;
const targetPath = `${dirPath}/environment.ts`;
const environment: TEnvironmentType =
  (process.env['VERCEL_ENV'] as TEnvironmentType) ?? 'development';

// Genera una ruta absoluta a la API en función del ambiente
const generateApiUrl = (environment: TEnvironmentType): string => {
  let url = '';

  // Lectura de la variable de entorno de Vercel para deployments de preview
  if (environment === 'preview' || environment === 'staging') {
    url = `https://${process.env['VERCEL_URL']}/` as string;
  }

  if (environment === 'production') {
    url = process.env['CUENTONETA_WEBSITE'] as string;
  }

  return url;
};

// Obtiene la vista de preview para generar skeletons
const fetchStorylistsPreviewDeckConfig = () =>
  client.fetch(
    `*[_type == 'storylist']
                    { 
                        'slug': slug.current,
                        'title': title,
                        'ordering': previewGridConfig.ordering,
                        'orderInLandingPage': previewGridConfig.landingPageOrder,
                        'previewGridSkeletonConfig': {
                            'gridTemplateColumns': previewGridConfig.gridTemplateColumns,
                            'titlePlacement': previewGridConfig.titlePlacement,
                            'cardsPlacement': previewGridConfig.cardsPlacement[] {
                              'order': order,
                              'slug': @.publication->story->slug.current,
                              'startCol': startCol,
                              'image': image,
                              'imageSlug': imageSlug.current,
                              'endCol': endCol,
                              'startRow': startRow,
                              'endRow': endRow,
                            }
                        },
                        'gridSkeletonConfig': {
                            'gridTemplateColumns': gridConfig.gridTemplateColumns,
                            'titlePlacement': gridConfig.titlePlacement,
                            'cardsPlacement': gridConfig.cardsPlacement[] {
                              'order': order,
                              'slug': @.publication->story->slug.current,
                              'startCol': startCol,
                              'image': image,
                              'imageSlug': imageSlug.current,
                              'endCol': endCol,
                              'startRow': startRow,
                              'endRow': endRow,
                            }
                        }
                    } | order (orderInLandingPage asc)`
  );

fetchStorylistsPreviewDeckConfig().then((storylists: StorylistDeckConfig[]) => {
  console.log(storylists);
  // Accede a las variables de entorno y genera un string
  // correspondiente al objeto environment que utilizará Angular
  const environmentFileContent = `
    export const environment = {
       environment: "${environment}",
       contentConfig: ${JSON.stringify(
         storylists
           .filter(
             (storylist: any) =>
               !!storylist.previewGridSkeletonConfig.cardsPlacement
           )
           .map((storylist: any) => ({
             ...storylist,
             amount: storylist.previewGridSkeletonConfig.cardsPlacement.filter(
               (card: any) => !!card.slug
             ).length,
           }))
       )},
       website: "${process.env['CUENTONETA_WEBSITE']}",
       apiUrl: "${generateApiUrl(environment)}"
    };
`;

  // En caso de que no exista el directorio environments, se lo crea
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath);
  }

  // Escribe el contenido en el archivo correspondiente environment.ts
  writeFile(
    targetPath,
    environmentFileContent,
    { flag: 'w' },
    function (err: ErrnoException | null) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(`Variables de entorno escritas en ${targetPath}`);
    }
  );
});
