import { useEffect, useState } from 'react';
import { CrmOrganizationService } from '@fsd/entities/crm-organization';
import { useIsMounted } from '@fsd/shared/lib/hooks';
import { IUseSearchResponse } from '../use-search.types';

export const useSearchOrganizations = (searchValue: string) => {
	const [search] = CrmOrganizationService.search();
	const [results, setResults] = useState<IUseSearchResponse[]>([]);
	const isMounted = useIsMounted();

	useEffect(() => {
		(async () => {
			if (searchValue) {
				const { data: response } = await search({
					search: searchValue,
					sort: { take: 20 },
				});

				if (!response || !isMounted) {
					return;
				}
				setResults(
					response.data.map((item) => ({
						type: 'organization',
						id: item.id,
						name: `${item.nameEn} (${item.nameRu})`,
						description: `${item.contacts?.map((contact) => contact.name).join(', ')}`,
						userId: item.userId,
						user: item.user,
						isArchive: item.isArchive,
						requisites: item.requisites?.map(({ name }) => name) ?? [],
					}))
				);
			}
		})();
	}, [isMounted, search, searchValue]);

	return results;
};
