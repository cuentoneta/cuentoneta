export const resourcesSubQuery: string = `                              	
								resources[]{ 
                              	title, 
                              	url, 
                              	resourceType->{ 
                              		title, 
                              		description, 
                              		'icon': { 
                              			'name': icon.name, 
                              			'svg': icon.svg, 
                              			'provider': icon.provider 
                              			} 
                              		} 
                              	} `;
