import { useCallback, useMemo } from 'react';
import { Account1CService } from '@fsd/entities/account-1c';
import { FetchStatus } from '@fsd/shared/lib/fetch-status';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useCrmCardActions } from '../../../crm-card';
import { ICrmOrganizationEntity } from '../../entity';
import { CrmOrganizationService } from '../../model/service';
import { useActions } from '../useActions/useActions';

interface IExec {
	id: number | string;
}

type IResponse = [
	(props: IExec) => void,
	{
		data: ICrmOrganizationEntity | null;
		status: (typeof FetchStatus)[number] | null;
	}
];

export const useGetCurrent = (): IResponse => {
	const organizationActions = useActions();
	const cardActions = useCrmCardActions();
	const [getCurrentByIdFetch] = CrmOrganizationService.getCurrentById();
	const [getLastUpdateFetch] = Account1CService.getLastUpdate();

	const data = useStateSelector((state) => state.crm_organization.data.current);
	const status = useStateSelector((state) => state.crm_organization.status.current);

	const memoData = useMemo(() => data, [data]);
	const memoStatus = useMemo(() => status, [status]);

	const exec = useCallback(
		async ({ id }: IExec) => {
			await getLastUpdateFetch({ organizationId: Number(id) });
			const response = await getCurrentByIdFetch({ id }, false);
			if ('data' in response && response.data) {
				organizationActions.setDataCurrent(response.data);
			}
			cardActions.setIsLoading(false);
			cardActions.setIsFetching(false);
		},
		[cardActions, getCurrentByIdFetch, getLastUpdateFetch, organizationActions]
	);

	return [exec, { data: memoData, status: memoStatus || 'uninitialized' }];
};
