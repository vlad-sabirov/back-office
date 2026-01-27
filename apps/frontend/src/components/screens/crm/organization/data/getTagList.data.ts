import { CrmOrganizationTagResponse } from '@interfaces';
import { CrmOrganizationTagService } from '@services';

export const getTagListData = async (): Promise<CrmOrganizationTagResponse[]> => {
	const [response] = await CrmOrganizationTagService.findMany({
		where: {},
		filter: { orderBy: { name: 'asc' } },
	});
	return response ?? [];
};
