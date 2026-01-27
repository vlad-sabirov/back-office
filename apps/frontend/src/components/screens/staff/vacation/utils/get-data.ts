import { VacationResponse } from '../interfaces';
import { VacationService } from '../vacation.service';
import { VacationStoreDate } from '../vacation.store';

export const getData = async ({
	date,
	userId,
	filterDepartmentId,
	filterTerritoryId,
	filterIsFake,
}: {
	date?: VacationStoreDate;
	userId?: number | string;
	filterDepartmentId?: string | null;
	filterTerritoryId?: string | null;
	filterIsFake?: boolean;
}): Promise<VacationResponse[]> => {
	const [response] = await VacationService.findMany(
		{
			userId: userId ? Number(userId) : undefined,
			OR: [
				{ dateStart: { lte: date?.dateEnd }, dateEnd: { gte: date?.dateStart } },
				{ dateStart: { gte: date?.dateStart }, dateEnd: { lte: date?.dateEnd } },
			],
			user:
				filterDepartmentId || filterTerritoryId
					? {
							departmentId: filterDepartmentId ? Number(filterDepartmentId) : undefined,
							territoryId: filterTerritoryId ? Number(filterTerritoryId) : undefined,
						}
					: undefined,
			isFake: filterIsFake ? undefined : false,
		},
		{},
		{ user: true }
	);
	if (response) return response;
	return [];
};
