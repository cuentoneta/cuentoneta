import { CodeBlockIcon } from '@sanity/icons';

import { LandingPageListPane } from '../components/LandingPageListPane';

// B2: reemplaza la lista nativa de landing pages por el pane con badge "Activa".
export const landingPageListItem = (S) =>
	S.listItem()
		.title('Páginas de Inicio')
		.id('landingPage')
		.icon(CodeBlockIcon)
		.child(S.component(LandingPageListPane).title('Páginas de Inicio').id('landingPage-list'));
