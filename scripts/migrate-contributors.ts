/**
 * Script para migrar programáticamente los colaboradores de La Cuentoneta
 * desde el HTML hardcodeado en about.component.html a documentos de tipo 'contributor'
 * en Sanity.
 *
 * Los colaboradores se organizan en sus respectivas áreas:
 * - staff
 * - programming
 * - content-generation
 * - content-pick (Selección, transcripción y curación de contenido)
 *
 * Uso: npx ts-node scripts/migrate-contributors.ts
 */

import { getClient } from '../src/api/_helpers/sanity-connector';
import slugify from 'slugify';

// Interfaz para los datos de colaboradores
interface ContributorData {
	name: string;
	handle?: string;
	url?: string;
	notes?: string;
	area: 'staff' | 'programming' | 'content-generation' | 'content-pick';
}

// Datos de colaboradores extraídos del HTML de about.component.html
const contributors: ContributorData[] = [
	// Staff
	{
		name: 'Ramiro Olivencia',
		handle: '@rolivenc',
		url: 'https://twitter.com/rolivenc',
		notes: 'Líder de Proyecto',
		area: 'staff',
	},
	{
		name: 'Maxi Cris',
		handle: '@maxicris',
		url: 'https://twitter.com/_maxicris',
		notes: 'Diseño UX/UI',
		area: 'staff',
	},

	// Programación (desde about.component.ts)
	{
		name: 'Erik Giovani',
		handle: '@ErikGiovani',
		url: 'https://github.com/erikgiovani',
		area: 'programming',
	},
	{
		name: 'Juan Blas Tschopp',
		handle: '@juanblas09',
		url: 'https://twitter.com/juanblas09',
		area: 'programming',
	},
	{
		name: 'Diego Franchina',
		handle: '@SoyDiego',
		url: 'https://github.com/SoyDiego',
		area: 'programming',
	},
	{
		name: 'Jimer Espinoza',
		handle: '@JimerSamuel',
		url: 'https://twitter.com/JimerSamuel',
		area: 'programming',
	},
	{
		name: 'Soledad Sasia',
		handle: '@SoleSasia',
		url: 'https://github.com/SoleSasia',
		area: 'programming',
	},
	{
		name: 'Mia Ramos',
		handle: '@MiaFate',
		url: 'https://github.com/MiaFate',
		area: 'programming',
	},
	{
		name: 'Wilson Lasso',
		handle: '@wilago',
		url: 'https://github.com/wilago',
		area: 'programming',
	},
	{
		name: 'Gustavo Petruzzi',
		handle: '@gustavoPetruzzi',
		url: 'https://github.com/gustavoPetruzzi',
		area: 'programming',
	},
	{
		name: 'Juan Romero',
		handle: '@Addin',
		url: 'https://github.com/Addin',
		area: 'programming',
	},
	{
		name: 'Alexis Martínez',
		handle: '@AlexRGB2',
		url: 'https://github.com/AlexRGB2',
		area: 'programming',
	},
	{
		name: 'John Angel',
		handle: '@Jeangel',
		url: 'https://github.com/Jeangel',
		area: 'programming',
	},
	{
		name: 'Luciano Aieta',
		handle: '@lgaieta',
		url: 'https://github.com/lgaieta',
		area: 'programming',
	},
	{
		name: 'Nito Crespo',
		handle: '@Nito-Crespi',
		url: 'https://github.com/Nito-Crespi',
		area: 'programming',
	},
	{
		name: 'Abraham Borja',
		handle: '@Aborja-dev',
		url: 'https://github.com/Aborja-dev',
		area: 'programming',
	},
	{
		name: 'Silvia Trujillano',
		handle: '@7SilviaT',
		url: 'https://github.com/7SilviaT',
		area: 'programming',
	},
	{
		name: 'Lucas Ezequiel Ojeda',
		handle: '@lezojeda',
		url: 'https://github.com/lezojeda',
		area: 'programming',
	},
	{
		name: 'Francisco Hanna',
		handle: '@franciscohanna92',
		url: 'https://github.com/franciscohanna92',
		area: 'programming',
	},
	{
		name: 'Abraham Villalba',
		handle: '@abraham-villalba',
		url: 'https://github.com/abraham-villalba',
		area: 'programming',
	},
	{
		name: 'Moisés Rodríguez',
		handle: '@moisesrj97',
		url: 'https://github.com/moisesrj97',
		area: 'programming',
	},

	// Generación de contenido
	{
		name: 'Sofía Abramovich',
		handle: '@__sofiaabigail',
		url: 'https://twitter.com/__sofiaabigail',
		notes: 'Autora de Instrucciones para leer en Otoño',
		area: 'content-generation',
	},
	{
		name: 'Marian Erro',
		handle: '@marianerro',
		url: 'https://twitter.com/MarianaErro',
		notes: 'Autoría de Verano en Naón',
		area: 'content-generation',
	},
	{
		name: 'Ladrón de Säbado',
		handle: '@ladrondesabado',
		url: 'https://twitter.com/ladrondesabado',
		notes:
			'Propuesta y organización de los Spaces "Desde el Sótano de la Casa de la Calle Garay", con lecturas y análisis de cuentos de Borges',
		area: 'content-generation',
	},
	{
		name: 'Elk A.',
		handle: '@A-Elkkk-o-k',
		url: 'https://www.wattpad.com/user/A-Elkkk-o-k',
		notes: 'Autoría',
		area: 'content-generation',
	},

	// Selección, transcripción y curación de contenido
	{
		name: 'Patricio Decoud',
		handle: '@arrobapato',
		url: 'https://twitter.com/arroba_pato',
		area: 'content-pick',
	},
	{
		name: 'Juan Balmaceda',
		handle: '@balm4ceda',
		url: 'https://twitter.com/balm4ceda',
		area: 'content-pick',
	},
	{
		name: 'Facundo Kaufmann',
		handle: '@facukaufmann',
		url: 'https://twitter.com/facukaufmann',
		area: 'content-pick',
	},
	{
		name: 'Candela Godoy',
		handle: '@napsiex',
		url: 'https://twitter.com/napsiex',
		area: 'content-pick',
	},
	{
		name: 'Analía Ale',
		handle: '@analía-ale',
		url: 'https://www.linkedin.com/in/anali%CC%81a-ale-5673a6204/',
		area: 'content-pick',
	},
	{
		name: 'Brahian Pereyra',
		handle: '@brahianpdev',
		url: 'https://twitter.com/brahianpdev',
		area: 'content-pick',
	},
	{
		name: 'Juan Romero',
		handle: '@juanr0mer0',
		url: 'https://www.linkedin.com/in/juanr0mer0',
		area: 'content-pick',
	},
	{
		name: 'Luis Omar Sánchez Díaz',
		handle: '@luisthepower',
		url: 'https://www.instagram.com/luisthepower/',
		area: 'content-pick',
	},
	{
		name: 'Karla Nevárez',
		handle: 'kanemu36@gmail.com',
		url: 'mailto:kanemu36@gmail.com',
		area: 'content-pick',
	},
	{
		name: 'Sebastián Mansilla',
		area: 'content-pick',
	},
	{
		name: 'Lolo Díaz',
		handle: '@estre.sadx',
		url: 'https://instagram.com/estre.sadx',
		area: 'content-pick',
	},
	{
		name: 'Nicolás Contrera',
		handle: '@nicontrera1',
		url: 'https://twitter.com/nicontrera1',
		area: 'content-pick',
	},
];

/**
 * Genera un slug a partir del nombre del colaborador
 */
const generateSlug = (name: string): string => {
	return slugify(name.toLowerCase(), {
		replacement: '-',
		lower: true,
		strict: true,
		trim: true,
	});
};

/**
 * Obtiene los documentos de colaboradores existentes en Sanity
 */
const fetchExistingContributors = async (): Promise<any[]> => {
	return getClient().fetch(`*[_type == 'contributor'] { _id, slug }`);
};

/**
 * Construye los documentos de colaboradores listos para ser creados en Sanity
 * Filtra aquellos que ya existen basándose en el slug
 */
const buildContributorDocuments = (contributorsList: ContributorData[], existingContributors: any[]): any[] => {
	// Crea un set con los slugs existentes para búsqueda rápida
	const existingSlugs = new Set(existingContributors.map((c) => c.slug?.current));

	return contributorsList
		.map((contributor) => {
			const slug = generateSlug(contributor.name);
			return {
				slug,
				document: {
					_type: 'contributor',
					name: contributor.name,
					slug: {
						_type: 'slug',
						current: slug,
					},
					area: contributor.area,
					link: {
						handle: contributor.handle || null,
						url: contributor.url || null,
					},
					notes: contributor.notes || null,
				},
			};
		})
		.filter((item) => !existingSlugs.has(item.slug));
};

/**
 * Crea una transacción para crear múltiples documentos
 */
const createTransaction = (documentItems: any[]) => {
	return documentItems.reduce((tx: any, item: any) => tx.create(item.document), getClient().transaction());
};

/**
 * Ejecuta la migración de colaboradores
 */
const migrateContributors = async (): Promise<void> => {
	try {
		console.log('🚀 Iniciando migración de colaboradores...\n');

		// Obtiene colaboradores existentes
		console.log('🔍 Verificando colaboradores existentes en Sanity...');
		const existingContributors = await fetchExistingContributors();
		console.log(`   ✓ Se encontraron ${existingContributors.length} colaboradores existentes\n`);

		// Construye documentos, filtrando los que ya existen
		const documentsToCreate = buildContributorDocuments(contributors, existingContributors);

		if (documentsToCreate.length === 0) {
			console.log('ℹ️  No hay nuevos colaboradores para crear.');
			console.log('   Todos los colaboradores ya existen en Sanity.\n');
			console.log('💡 Si deseas agregar nuevos colaboradores, edita el array');
			console.log('   "contributors" en este script y ejecuta nuevamente.\n');
			process.exit(0);
		}

		console.log(`📋 Se crearán ${documentsToCreate.length} nuevos documentos de colaboradores:\n`);
		console.log('Resumen por área:');

		const areas = {
			staff: 0,
			programming: 0,
			'content-generation': 0,
			'content-pick': 0,
		} as Record<string, number>;

		documentsToCreate.forEach((item) => {
			areas[item.document.area]++;
		});

		console.log(`  - Staff: ${areas.staff}`);
		console.log(`  - Programación: ${areas.programming}`);
		console.log(`  - Generación de contenido: ${areas['content-generation']}`);
		console.log(`  - Selección, transcripción y curación: ${areas['content-pick']}`);
		console.log('\n📝 Nuevos documentos a crear:\n');

		documentsToCreate.forEach((item) => {
			const doc = item.document;
			console.log(`  • ${doc.name} (${doc.area})`);
			if (doc.link.handle) {
				console.log(`    └─ ${doc.link.handle}`);
			}
			if (doc.notes) {
				console.log(`    └─ Notas: ${doc.notes}`);
			}
		});

		console.log('\n⏳ Creando documentos en Sanity...\n');

		const transaction = createTransaction(documentsToCreate);
		await transaction.commit();

		console.log('✅ ¡Migración completada exitosamente!');
		console.log(`✨ Se crearon ${documentsToCreate.length} nuevos documentos de colaboradores.\n`);

		// Mostrar resumen de colaboradores existentes
		if (existingContributors.length > 0) {
			console.log('⏭️  Colaboradores que ya existían (no fueron duplicados):');
			console.log(`   ${existingContributors.length} colaboradores\n`);
		}

		console.log('💡 Próximos pasos:');
		console.log('   1. Verifica en Sanity Studio que todos los colaboradores se hayan creado correctamente');
		console.log('   2. Ajusta manualmente cualquier información faltante o datos incorrectos');
		console.log('   3. Actualiza el componente about.component.html para usar los datos de Sanity\n');

		process.exit(0);
	} catch (error) {
		console.error('❌ Error durante la migración:', error);
		process.exit(1);
	}
};

// Ejecutar la migración
migrateContributors();
