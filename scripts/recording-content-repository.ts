import type { LandingPageContent, RotatingContent } from '@models/landing-page-content.model';
import type {
	ContentRepository,
	LandingPageCreatePayload,
	LandingPageReferences,
	LandingPageSummary,
} from '../src/api/modules/content/content.repository';

/**
 * Registra las escrituras que pide el service y las reenvía al repository real solo si `apply` está
 * activo: una tarea en seco usa el service de producción y reporta qué escribiría.
 */
export class RecordingContentRepository implements ContentRepository {
	public readonly landingPages: LandingPageCreatePayload[] = [];
	public mostReadSlugs: readonly string[] = [];

	constructor(
		private readonly delegate: ContentRepository,
		private readonly apply: boolean,
	) {}

	public fetchLandingPageContent(slug: string): Promise<LandingPageContent | null> {
		return this.delegate.fetchLandingPageContent(slug);
	}

	public fetchRotatingContent(): Promise<RotatingContent | null> {
		return this.delegate.fetchRotatingContent();
	}

	public fetchLandingPagesList(slugs: string[]): Promise<readonly LandingPageSummary[]> {
		return this.delegate.fetchLandingPagesList(slugs);
	}

	public fetchLatestLandingPageReferences(currentSlug: string): Promise<LandingPageReferences | null> {
		return this.delegate.fetchLatestLandingPageReferences(currentSlug);
	}

	public async createLandingPages(landingPageObjects: LandingPageCreatePayload[]): Promise<unknown[]> {
		this.landingPages.push(...landingPageObjects);
		return this.apply ? this.delegate.createLandingPages(landingPageObjects) : landingPageObjects;
	}

	public async updateMostReadLiteraryWorks(slugs: readonly string[]): Promise<void> {
		this.mostReadSlugs = slugs;
		if (this.apply) {
			await this.delegate.updateMostReadLiteraryWorks(slugs);
		}
	}
}
