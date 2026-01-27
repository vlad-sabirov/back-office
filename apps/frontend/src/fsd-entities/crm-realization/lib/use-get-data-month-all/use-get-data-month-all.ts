import { useEffect, useState } from 'react';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { LinkedList } from '../linked-list/linked-list';
import { ILinkedListAll } from '../linked-list/types.linked-list';

export const useGetDataMonthAll = () => {
	const data = useStateSelector((state) => state.crm_realization.data.monthAll);
	const [linkedData, setLinkedData] = useState<ILinkedListAll | null>(null);
	useEffect(() => {
		setLinkedData(LinkedList(data));
	}, [data]);
	return linkedData;
};
