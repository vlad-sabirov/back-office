import { useEffect, useState } from 'react';
import { CrmContactService } from '@fsd/entities/crm-contact';
import { useIsMounted } from '@fsd/shared/lib/hooks';
import { IUseSearchResponse } from '../use-search.types';

export const useSearchContacts = (searchValue: string) => {
	const [search] = CrmContactService.search();
	const [results, setResults] = useState<IUseSearchResponse[]>([]);
	const isMounted = useIsMounted();

	useEffect(() => {
		(async () => {
			if (searchValue) {
				const { data: response } = await search({ search: searchValue });
				if (!response || !isMounted) {
					return;
				}
				setResults(
					response.data.map((item) => ({
						type: 'contact',
						id: item.id,
						name: item.name,
						description: `${item.organizations?.map((org) => `${org.nameEn} (${org.nameRu})`).join(', ')}`,
						userId: item.userId,
						user: item.user,
						isArchive: item.isArchive,
					}))
				);
			}
		})();
	}, [isMounted, search, searchValue]);

	return results;
};
