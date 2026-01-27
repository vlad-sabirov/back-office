import { useCallback, useEffect } from 'react';
import { useCrmHistoryActions } from '@fsd/entities/crm-history';
import { useCrmOrganizationGetCurrent } from '@fsd/entities/crm-organization';
import { useCrmCardActions } from '../..';
import { Types } from '../../config/enums';

export const useShowOrganization = () => {
	const cardActions = useCrmCardActions();
	const historyActions = useCrmHistoryActions();
	const [getOrg, { data: dataOrg, status: statusOrg }] = useCrmOrganizationGetCurrent();

	useEffect(() => {
		if (statusOrg !== 'success' || !dataOrg) {
			return;
		}
		cardActions.setIsLoading(false);
		cardActions.setIsFetching(false);
	}, [cardActions, dataOrg, statusOrg]);

	return useCallback(
		({ id }: { id: number | string }) => {
			historyActions.setConfigOrganizationIDs([]);
			historyActions.setConfigContactIDs([]);
			cardActions.setIsShow(true);
			cardActions.setIsLoading(true);
			cardActions.setType(Types.Organization);
			getOrg({ id });
			historyActions.setConfigOrganizationIDs([id]);
		},
		[cardActions, getOrg, historyActions]
	);
};
