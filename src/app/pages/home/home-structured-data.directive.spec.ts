import { clearAllMocks } from '@test-utils';
import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';

import { PAGE_SCOPED_SCHEMA_IDS, SchemaOrgService } from '../../providers/schema-org.service';
import { HomeStructuredDataDirective } from './home-structured-data.directive';

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
	});

	it('should remove collection and breadcrumb-storylist left by a previous storylist route', () => {
		const schemaOrg = TestBed.inject(SchemaOrgService);
		schemaOrg.setJsonLd('collection', { '@type': 'CollectionPage' });
		schemaOrg.setJsonLd('breadcrumb-storylist', { '@type': 'BreadcrumbList' });

		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="collection"]')).toBeNull();
		expect(head.querySelector('script[data-schema-id="breadcrumb-storylist"]')).toBeNull();
	});

	it('should remove every page-scoped block on init', () => {
		const schemaOrg = TestBed.inject(SchemaOrgService);
		for (const id of PAGE_SCOPED_SCHEMA_IDS) {
			schemaOrg.setJsonLd(id, { '@type': 'Test' });
		}

		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		for (const id of PAGE_SCOPED_SCHEMA_IDS) {
			expect(head.querySelector(`script[data-schema-id="${id}"]`)).toBeNull();
		}
	});

	it('should not remove sitewide blocks (organization, website)', () => {
		const schemaOrg = TestBed.inject(SchemaOrgService);
		schemaOrg.setJsonLd('organization', { '@type': 'Organization' });
		schemaOrg.setJsonLd('website', { '@type': 'WebSite' });
		schemaOrg.setJsonLd('collection', { '@type': 'CollectionPage' });

		instantiate();
		TestBed.tick();

		const head = TestBed.inject(DOCUMENT).head;
		expect(head.querySelector('script[data-schema-id="organization"]')).not.toBeNull();
		expect(head.querySelector('script[data-schema-id="website"]')).not.toBeNull();
		expect(head.querySelector('script[data-schema-id="collection"]')).toBeNull();
	});
});
