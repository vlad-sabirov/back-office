import { useCallback, useEffect, useState } from 'react';
import { useAccess } from '@fsd/shared/lib/hooks';
import { ACCESS } from '../../config/constants';
import { CrmRealizationService } from '../../index';
import { useActions } from '../use-actions/use-actions';

export const useStateConfigure = () => {
	const actions = useActions();
	const isAccessReports = useAccess({ access: ACCESS.DISPLAY_REALIZATION });
	const isAccessAllReports = useAccess({ access: ACCESS.DISPLAY_ALL_REALIZATION });
	const [timer, setTimer] = useState<ReturnType<typeof setInterval>>();

	const [getMonthAllFetch, { data: dataMonthAll }] = CrmRealizationService.getMonthAll();

	const handleGetData = useCallback(async () => {
		if (!isAccessReports && !isAccessAllReports) {
			return;
		}
		actions.setIsLoading(true);
		const resAll = await getMonthAllFetch();
		if ('data' in resAll && resAll.data) {
			actions.setDataMonthAll(resAll.data);
		}
		actions.setIsLoading(false);
	}, [actions, getMonthAllFetch, isAccessAllReports, isAccessReports]);

	useEffect(() => {
		handleGetData().then();
	}, [dataMonthAll, handleGetData]);

	useEffect(
		() => () => {
			clearInterval(timer);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	return useCallback(() => {
		handleGetData().then();
		const timer = setInterval(handleGetData, 300000);
		// const timer = setInterval(handleGetData, 1000);
		setTimer(timer);
	}, [handleGetData]);
};
