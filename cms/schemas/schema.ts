// First, we must import the schema creator
// Then import schema types from any plugins that might expose them

// We import object and document schemas
import author from './author';
import blockContent from './blockContent';
import nationality from './nationality';
import landingPage from './landingPage';
import story from './story';
import storylist from './storylist';
import tag from './tag';
import { resourceType, resource } from './resourceType';
import publication from './publication';
import contentCampaign from './contentCampaign';

export default [
	// Tipos de propiedades
	blockContent,
	publication,
	resource,
	// Tipos de documentos
	landingPage,
	contentCampaign,
	storylist,
	story,
	author,
	nationality,
	resourceType,
	tag,
];
