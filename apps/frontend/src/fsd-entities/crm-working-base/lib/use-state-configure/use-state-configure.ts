import { useCallback, useEffect, useState } from 'react';
import { IWorkingBaseRes } from '../../api/res';
import { CrmWorkingBaseService } from '../../index';
import { useActions } from '../use-actions/use-actions';

export const useStateConfigure = () => {
	const actions = useActions();
	const [timer, setTimer] = useState<ReturnType<typeof setInterval>>();

	const [getMonthAllFetch, { data: dataMonthAll }] = CrmWorkingBaseService.getAll();

	const handleGetData = useCallback(async () => {
		actions.setIsLoading(true);
		const resAll = await getMonthAllFetch();
		if ('data' in resAll && resAll.data) {
			const allMap: Record<string, IWorkingBaseRes> = {};
			for (const report of resAll.data) {
				allMap[`${report.year}-${report.month}`] = report;
			}
			actions.setDataAll(allMap);
			actions.setDataAllLast(resAll.data[resAll.data.length - 1]);
		}
		actions.setIsLoading(false);
	}, [actions, getMonthAllFetch]);

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
