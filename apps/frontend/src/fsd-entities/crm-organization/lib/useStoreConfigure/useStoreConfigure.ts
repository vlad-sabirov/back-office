import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { isEmpty } from 'lodash';
import {
	CrmOrganizationActions,
	CrmOrganizationConst,
	CrmOrganizationService,
	ICrmOrganizationEntity,
} from '@fsd/entities/crm-organization';
import { FetchStatusConvert } from '@fsd/shared/lib/fetch-status';
import { useAccess, useStateActions, useStateSelector } from '@fsd/shared/lib/hooks';
import { MainContext } from '@globalStore';
import { useUserDeprecated } from '@hooks';

export const useStoreConfigure = () => {
	const { templateStore } = useContext(MainContext);
	const actions = useStateActions(CrmOrganizationActions);
	const filterList = useStateSelector((state) => state.crm_organization.filter.list);
	const [fetchList, { data: allData, ...allProps }] = CrmOrganizationService.fetchList();
	const [fetchAll] = CrmOrganizationService.findMany();
	const [fetchVoip] = CrmOrganizationService.getVoip();
	const [getCountUnverifiedFetch] = CrmOrganizationService.getCountUnverified();
	const { team } = useUserDeprecated();
	const isFirstRender = useRef(true);
	const [countUnverifiedTimer, setCountUnverifiedTimer] = useState<ReturnType<typeof setInterval>>();

	const isMyAccess = useAccess({
		access: CrmOrganizationConst.Access.MyOrganization,
		ignoreAdmin: true,
	});

	const handleGetCountUnverified = useCallback(async () => {
		const response = await getCountUnverifiedFetch();
		if (response.data) {
			actions.setCount({ unverified: response.data ?? 0 });
		}
	}, [actions, getCountUnverifiedFetch]);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			const respAll = await fetchAll({ where: {} });
			if (!respAll?.data?.data || !isMounted) {
				return;
			}
			const data: Record<string | number, ICrmOrganizationEntity> = {};
			for (const item of respAll.data.data) {
				data[item.id] = item;
			}
			actions.setDataAll(data);
		})();
		return () => {
			isMounted = false;
		};
	}, [actions, fetchAll]);

	useEffect(() => {
		handleGetCountUnverified().then();
		const timer = setInterval(() => handleGetCountUnverified(), 15000);
		setCountUnverifiedTimer(timer);
		// noinspection BadExpressionStatementJS
		() => clearInterval(countUnverifiedTimer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [handleGetCountUnverified]);

	useEffect(() => {
		const limit = localStorage.getItem(CrmOrganizationConst.localStorage.ListLimit) ?? 25;
		actions.setFilterList({
			...filterList,
			page: 1,
			limit: Number(limit),
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [actions, isMyAccess]);

	useEffect(() => {
		templateStore.bodyRef?.current?.scrollTo({ top: 0, behavior: 'smooth' });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filterList.page]);

	useEffect(() => {
		if (!team || typeof isMyAccess === 'undefined') {
			return;
		}
		if (isFirstRender.current && !isEmpty(filterList)) {
			actions.setFilterList({ ...filterList, ignoreUserIds: [], userIds: isMyAccess ? team : undefined });
			isFirstRender.current = false;
			return;
		}
		if (!isEmpty(filterList)) {
			fetchList(filterList);
		}
	}, [actions, fetchList, filterList, isMyAccess, team]);

	useEffect(() => {
		(async () => {
			const response = await fetchVoip();
			if (!('data' in response) || !response.data) return;
			actions.setDataVoip(response.data);
		})();
	}, [actions, fetchVoip]);

	useEffect(() => {
		if (allData) {
			actions.setDataList(allData);
		}
	}, [allData, actions]);

	useEffect(() => {
		actions.setStatusList(FetchStatusConvert(allProps));
	}, [allProps, actions]);
};
