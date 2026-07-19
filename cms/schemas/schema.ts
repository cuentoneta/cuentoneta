// First, we must import the schema creator
// Then import schema types from any plugins that might expose them

// We import object and document schemas
import author from './author';
import blockContent from './blockContent';
import nationality from './nationality';
import landingPage from './landingPage';
import story from './story';
import literaryWork from './literaryWork';
import storylist from './storylist';
import tag from './tag';
import { resourceType, resource } from './resourceType';
import contentCampaign from './contentCampaign';
import contributors from './contributor';
import rotatingContent from './rotatingContent';

export default [
	// Tipos de propiedades
	blockContent,
	contributors,
	resource,
	// Tipos de documentos
	landingPage,
	contentCampaign,
	storylist,
	story,
	literaryWork,
	author,
	nationality,
	resourceType,
	tag,
	// Singletons
	rotatingContent,
];
