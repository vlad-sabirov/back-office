import { useCallback } from 'react';
import { FetchStatus } from '@fsd/shared/lib/fetch-status';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useCrmCardActions } from '../../../crm-card';
import { ICrmContactEntity } from '../../entity';
import { CrmContactService } from '../../model/service';
import { useActions } from '../useActions/useActions';

interface IExec {
	id: number | string;
}

type IResponse = [
	(props: IExec) => void,
	{
		data: ICrmContactEntity | null;
		status: (typeof FetchStatus)[number] | null;
	}
];

export const useGetCurrent = (): IResponse => {
	const contactActions = useActions();
	const cardActions = useCrmCardActions();
	const [getCurrentByIdFetch] = CrmContactService.getCurrentById();

	const data = useStateSelector((state) => state.crm_contact.data.current);
	const status = useStateSelector((state) => state.crm_contact.status.current);

	const exec = useCallback(
		async ({ id }: IExec) => {
			const response = await getCurrentByIdFetch({ id }, false);
			if ('data' in response && response.data) {
				contactActions.setDataCurrent(response.data);
			}
			cardActions.setIsFetching(false);
			cardActions.setIsLoading(false);
		},
		[cardActions, contactActions, getCurrentByIdFetch]
	);

	return [exec, { data, status: status || 'uninitialized' }];
};
