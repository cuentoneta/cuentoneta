import { Contributor } from '@models/contributor.model';
import { fetchAllContributors } from './contributor.repository';
import { NotFoundError } from '../../exceptions/exceptions';

export async function getAllContributors(): Promise<Contributor[]> {
	const contributors = await fetchAllContributors();

	if (!contributors) {
		throw new NotFoundError('Could not fetch the list of contributors.');
	}

	return contributors;
}
