import { useContext, useEffect } from 'react';
import { MainContext } from '@globalStore';

export const useGetData = () => {
	const { staffStore } = useContext(MainContext);

	useEffect(() => {
		if (!staffStore.hasGetData) {
			staffStore.getUserRoleList();
			staffStore.getDepartmentList();
			staffStore.getTerritoryList();
			staffStore.setHasGetData(true);
		}
	}, [staffStore]);
};
