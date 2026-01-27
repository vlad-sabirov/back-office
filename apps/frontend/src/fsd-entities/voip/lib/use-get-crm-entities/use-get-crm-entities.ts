import { useEffect, useState } from 'react';
import { uniq } from 'lodash';
import { CrmContactService } from '@fsd/entities/crm-contact';
import { CrmOrganizationService } from '@fsd/entities/crm-organization';
import { IStaffEntity } from '@fsd/entities/voip/lib/use-get-crm-entities/use-get-crm-entities.types';
import { IAnalyticsItemWithStage } from '../../api/res/analytics.res';

export const useGetCrmEntities = (analytic: IAnalyticsItemWithStage[]) => {
	const [fetchFindOrg] = CrmOrganizationService.findMany();
	const [fetchFindCont] = CrmContactService.findMany();
	const [data, setData] = useState<Record<string, IStaffEntity>>({});

	useEffect(() => {
		if (!analytic.length) return;

		(async () => {
			const output: Record<string, IStaffEntity> = {};
			const phones: string[] = uniq(analytic.map(({ caller }) => caller));

			const resOrg = await fetchFindOrg({
				where: { phones: { some: { value: { in: phones } } } } as any,
				include: { phones: true },
			});
			resOrg?.data?.data?.forEach((org) => {
				org.phones?.forEach((phone) => {
					output[phone.value] = {
						id: org.id,
						name: `${org.nameEn} (${org.nameRu})`,
						type: 'organization',
					};
				});
			});

			const resCont = await fetchFindCont({
				where: { phones: { some: { value: { in: phones } } } } as any,
				include: { phones: true },
			});
			resCont?.data?.data?.forEach((cont) => {
				cont.phones?.forEach((phone) => {
					output[phone.value] = {
						id: cont.id,
						name: cont.name,
						type: 'contact',
					};
				});
			});

			setData(output);
		})();
	}, [analytic, fetchFindCont, fetchFindOrg]);

	return data;
};
