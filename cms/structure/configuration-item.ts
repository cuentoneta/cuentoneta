import { singletonDocumentListItems } from 'sanity-plugin-singleton-management';

export const configurationItem = (S, context) =>
	S.listItem()
		.title('Configuración')
		.id('configuration')
		.child(
			S.list()
				.title('Configuración')
				.items([...singletonDocumentListItems({ S, context })]),
		);
