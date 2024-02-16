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
import ErrnoException = NodeJS.ErrnoException;

// Tipo que describe los diferentes tipos de ambientes en los que puede ejecutarse el presente script
type TEnvironmentType = 'development' | 'preview' | 'staging' | 'production';

const dirPath = `src/app/environments`;
const targetPath = `${dirPath}/environment.ts`;

// Constantes para generar el archivo de environment
const environment: TEnvironmentType =
    (process.env['VERCEL_ENV'] as TEnvironmentType) ?? 'development';

const branchUrl: string = process.env['VERCEL_BRANCH_URL'] as string;
const stagingBranchUrl = 'cuentoneta-git-develop-cuentoneta.vercel.app';

// Genera una ruta absoluta a la API en función del ambiente
const generateApiUrl = (
  environment: TEnvironmentType,
  branchUrl: string
): string => {
  let url = '';

  // Asigna URL en base a variables de entorno para producción y staging (preview develop)
  // El lado derecho de la comparación es utilizado para deployments de staging
  if (environment === 'production' || branchUrl === stagingBranchUrl) {
    url = process.env['CUENTONETA_WEBSITE'] as string;
  }
  // Lectura de la variable de entorno de Vercel para deployments de preview
  else if (environment === 'preview') {
    url = `https://${process.env['VERCEL_URL']}/` as string;
  }

  return url;
};

const apiUrl = generateApiUrl(environment, branchUrl);

// Obtiene la vista de preview para generar skeletons
const fetchStorylistsPreviewDeckConfig = () => {
  const subQuery = `{
        'slug': slug.current,
        'title': title,
        'ordering': previewGridConfig.ordering,
        'previewGridSkeletonConfig': {
            'gridTemplateColumns': previewGridConfig.gridTemplateColumns,
            'titlePlacement': previewGridConfig.titlePlacement,
            'cardsPlacement': previewGridConfig.cardsPlacement[] {
            'order': order,
            'slug': @.publication.story->slug.current,
            'startCol': startCol,
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
            'slug': @.publication.story->slug.current,
            'startCol': startCol,
            'imageSlug': imageSlug.current,
            'endCol': endCol,
            'startRow': startRow,
            'endRow': endRow,
            }
        }
  }`;

  return client.fetch(
    `*[_type == 'landingPage'] {
            'previews': previews[]-> ${subQuery},
            'cards': cards[]-> ${subQuery}
          }[0]`
  );
};

fetchStorylistsPreviewDeckConfig().then(
  (landingPage: {
    previews: StorylistDeckConfig[];
    cards: StorylistDeckConfig[];
  }) => {
    // Accede a las variables de entorno y genera un string
    // correspondiente al objeto environment que utilizará Angular
    const environmentFileContent = `
    export const environment = {
       environment: "${environment}",
       contentConfig: { 
        previews: ${JSON.stringify(
          landingPage.previews
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
        cards: ${JSON.stringify(landingPage.cards)}
       },
       website: "${process.env['CUENTONETA_WEBSITE']}",
       apiUrl: "${apiUrl}"
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
        console.log(
          'Ambiente de Vercel - VERCEL_ENV = ',
          process.env['VERCEL_ENV']
        );
        console.log(
          'URL de branch de Vercel - VERCEL_BRANCH_URL = ',
          process.env['VERCEL_BRANCH_URL']
        );
        console.log('URL de API = ', apiUrl);
      }
    );
  }
);
