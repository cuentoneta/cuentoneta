import { clearAllMocks } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';

import { SchemaOrgService } from '../../providers/schema-org.service';
import { HomeStructuredDataDirective } from './home-structured-data.directive';

const CONTEXT = 'https://schema.org';

describe('HomeStructuredDataDirective', () => {
	function instantiate(): void {
		TestBed.runInInjectionContext(() => new HomeStructuredDataDirective());
	}

	beforeEach(() => {
		clearAllMocks();
		TestBed.configureTestingModule({ providers: [HomeStructuredDataDirective] });
	});

	afterEach(() => {
		TestBed.inject(DOCUMENT)
			.head.querySelectorAll('script[data-schema-id]')
			.forEach((el) => el.remove());
		TestBed.resetTestingModule();
	});

	it('should remove the blocks left by a previous collection route', () => {
		const schemaOrg = TestBed.inject(SchemaOrgService);
		schemaOrg.setPageScopedJsonLd('collection', { '@context': CONTEXT, '@type': 'CollectionPage' });
		schemaOrg.setPageScopedJsonLd('breadcrumb-collection', { '@context': CONTEXT, '@type': 'BreadcrumbList' });

		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="collection"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-collection"]')).toBeNull();
	});

	it('should remove page-scoped blocks left by any route, not just the collection one', () => {
		const schemaOrg = TestBed.inject(SchemaOrgService);
		schemaOrg.setPageScopedJsonLd('article', { '@context': CONTEXT, '@type': 'Article' });
		schemaOrg.setPageScopedJsonLd('profile-page', { '@context': CONTEXT, '@type': 'ProfilePage' });
		schemaOrg.setPageScopedJsonLd('collection', { '@context': CONTEXT, '@type': 'CollectionPage' });

		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="article"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="profile-page"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="collection"]')).toBeNull();
	});

	it('should not remove sitewide blocks (organization, website)', () => {
		const schemaOrg = TestBed.inject(SchemaOrgService);
		schemaOrg.setJsonLd('organization', { '@context': CONTEXT, '@type': 'Organization' });
		schemaOrg.setJsonLd('website', { '@context': CONTEXT, '@type': 'WebSite' });
		schemaOrg.setPageScopedJsonLd('collection', { '@context': CONTEXT, '@type': 'CollectionPage' });

		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="organization"]')).not.toBeNull();
		expect(head.querySelector('script[data-schema-id="website"]')).not.toBeNull();
		expect(head.querySelector('script[data-schema-id="collection"]')).toBeNull();
	});
});
