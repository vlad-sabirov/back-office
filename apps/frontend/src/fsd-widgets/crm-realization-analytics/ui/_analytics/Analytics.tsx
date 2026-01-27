import { FC } from 'react';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Month } from '../month/Month';
import { Year } from '../year/Year';

export const Analytics: FC = () => {
	const type = useStateSelector((state) => state.crm_realization.type);

	if (type === 'month') return <Month />;
	if (type === 'year') return <Year />;
	return null;
};
