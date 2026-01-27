import { CrmOrganizationTypeResponse } from '@interfaces';
import { CrmOrganizationTypeService } from '@services';

export const getTypeListData = async (): Promise<CrmOrganizationTypeResponse[]> => {
	const [response] = await CrmOrganizationTypeService.findMany({
		where: {},
		filter: { orderBy: { name: 'asc' } },
	});
	return response ?? [];
};
