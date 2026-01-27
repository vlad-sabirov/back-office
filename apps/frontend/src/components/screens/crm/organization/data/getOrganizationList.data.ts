import { CrmOrganizationResponse } from '@interfaces';
import { CrmOrganizationService } from '@services';

export type OrganizationListDataType = {
	userIds?: number[];
	include?: Record<string, boolean>;
	limit: number;
	page: number;
};

export const getOrganizationListData = async ({
	userIds,
	include,
	limit,
	page,
}: OrganizationListDataType): Promise<{ data: CrmOrganizationResponse[]; count: number } | null> => {
	const [response] = await CrmOrganizationService.findManyWithCount({
		where: {
			isArchive: false,
			OR: userIds ? userIds.map((userId) => ({ userId })) : undefined,
		},
		filter: {
			orderBy: { nameEn: 'asc' },
			skip: page === 0 || page === 1 ? undefined : (page - 1) * limit,
			take: limit,
		},
		include,
	});

	return response ?? null;
};
