import { useContext, useEffect, useRef } from 'react';
import { isEmpty } from 'lodash';
import { CrmContactActions, CrmContactConst } from '@fsd/entities/crm-contact';
import { CrmContactService, ICrmContactEntity } from '@fsd/entities/crm-contact';
import { FetchStatusConvert } from '@fsd/shared/lib/fetch-status';
import { useAccess, useStateActions, useStateSelector } from '@fsd/shared/lib/hooks';
import { MainContext } from '@globalStore';
import { useUserDeprecated } from '@hooks';

export const useStoreConfigure = () => {
	const { templateStore } = useContext(MainContext);
	const actions = useStateActions(CrmContactActions);
	const filterList = useStateSelector((state) => state.crm_contact.filter.list);
	const [fetchVoip] = CrmContactService.getVoip();
	const [fetchList, { data: allData, ...allProps }] = CrmContactService.fetchList();
	const [fetchAll] = CrmContactService.findMany();
	const { team } = useUserDeprecated();
	const isFirstRender = useRef(true);

	const isMyAccess = useAccess({
		access: CrmContactConst.Access.MyContacts,
		ignoreAdmin: true,
	});

	useEffect(() => {
		const limit = localStorage.getItem(CrmContactConst.localStorage.ListLimit) ?? 25;
		actions.setFilterList({
			...filterList,
			page: 1,
			limit: Number(limit),
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [actions]);

	useEffect(() => {
		templateStore.bodyRef?.current?.scrollTo({ top: 0, behavior: 'smooth' });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filterList.page]);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			const respAll = await fetchAll({ where: {} });
			if (!respAll?.data?.data || !isMounted) {
				return;
			}
			const data: Record<string | number, ICrmContactEntity> = {};
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
		if (!team || typeof isMyAccess === 'undefined') {
			return;
		}
		if (isFirstRender.current && !isEmpty(filterList)) {
			actions.setFilterList({ ...filterList, userIds: isMyAccess ? team : undefined });
			isFirstRender.current = false;
			return;
		}
		if (!isEmpty(filterList)) {
			fetchList(filterList);
		}
	}, [actions, fetchList, filterList, isMyAccess, team]);

	useEffect(() => {
		if (allData) {
			actions.setDataList(allData);
		}
	}, [allData, actions]);

	useEffect(() => {
		(async () => {
			const response = await fetchVoip();
			if (!('data' in response) || !response.data) return;
			actions.setDataVoip(response.data);
		})();
	}, [actions, fetchVoip]);

	useEffect(() => {
		actions.setStatusList(FetchStatusConvert(allProps));
	}, [allProps, actions]);
};
