import { useCallback, useEffect } from 'react';
import { useCrmContactGetCurrent } from '@fsd/entities/crm-contact';
import { useCrmHistoryActions } from '@fsd/entities/crm-history';
import { useCrmCardActions } from '../..';
import { Types } from '../../config/enums';

export const useShowContact = () => {
	const cardActions = useCrmCardActions();
	const historyActions = useCrmHistoryActions();
	const [getCont, { data: dataCont, status: statusCont }] = useCrmContactGetCurrent();

	useEffect(() => {
		if (statusCont !== 'success' || !dataCont) {
			return;
		}
		cardActions.setIsLoading(false);
		cardActions.setIsFetching(false);
	}, [cardActions, dataCont, statusCont]);

	return useCallback(
		({ id }: { id: number | string }) => {
			historyActions.setConfigOrganizationIDs([]);
			historyActions.setConfigContactIDs([]);
			cardActions.setIsShow(true);
			cardActions.setIsLoading(true);
			cardActions.setType(Types.Contact);
			getCont({ id });
			historyActions.setConfigContactIDs([id]);
		},
		[cardActions, getCont, historyActions]
	);
};
