import type { SanityFileAsset } from '@sanity-types';
import { onoffAudioAssets } from '../../onoff-audio-assets.mock';

export const geometriaAudioAssetDocument: SanityFileAsset = {
	_id: onoffAudioAssets.geometriaSpace.ref,
	_createdAt: '1974-06-12T00:00:00Z',
	_updatedAt: '1974-06-12T00:00:00Z',
	_rev: `rev-${onoffAudioAssets.geometriaSpace.ref}`,
	_type: 'sanity.fileAsset',
	assetId: onoffAudioAssets.geometriaSpace.ref,
	sha1hash: onoffAudioAssets.geometriaSpace.ref,
	extension: 'ogg',
	mimeType: 'audio/ogg',
	size: 1024,
	path: `files/onoff/${onoffAudioAssets.geometriaSpace.ref}.ogg`,
	url: onoffAudioAssets.geometriaSpace.path,
};
