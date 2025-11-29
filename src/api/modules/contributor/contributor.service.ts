import { Contributor } from '@models/contributor.model';
import { fetchAllContributors } from './contributor.repository';

export async function getAllContributors(): Promise<Contributor[]> {
	return fetchAllContributors();
}
