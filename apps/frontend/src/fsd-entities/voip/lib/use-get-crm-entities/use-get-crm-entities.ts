import { useEffect, useState } from 'react';
import { uniq } from 'lodash';
import { CrmContactService } from '@fsd/entities/crm-contact';
import { CrmOrganizationService } from '@fsd/entities/crm-organization';
import { IStaffEntity } from '@fsd/entities/voip/lib/use-get-crm-entities/use-get-crm-entities.types';
import { IAnalyticsItemWithStage } from '../../api/res/analytics.res';

export const useGetCrmEntities = (
	analytic: IAnalyticsItemWithStage[],
	phoneField: 'caller' | 'receiver' = 'caller',
) => {
	const [fetchFindOrg] = CrmOrganizationService.findMany();
	const [fetchFindCont] = CrmContactService.findMany();
	const [data, setData] = useState<Record<string, IStaffEntity>>({});

	useEffect(() => {
		if (!analytic.length) return;

		(async () => {
			const output: Record<string, IStaffEntity> = {};
			const phones: string[] = uniq(analytic.map((item) => item[phoneField]));

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
				include: { phones: true, organizations: true } as any,
			});
			resCont?.data?.data?.forEach((cont) => {
				const firstOrg = (cont as any).organizations?.[0];
				cont.phones?.forEach((phone) => {
					output[phone.value] = {
						id: cont.id,
						name: cont.name,
						type: 'contact',
						orgName: firstOrg ? firstOrg.nameRu || firstOrg.nameEn : undefined,
						orgId: firstOrg?.id,
					};
				});
			});

			setData(output);
		})();
	}, [analytic, phoneField, fetchFindCont, fetchFindOrg]);

	return data;
};
