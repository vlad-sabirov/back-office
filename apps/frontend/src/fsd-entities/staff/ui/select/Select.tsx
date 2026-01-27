import { FC, useMemo } from 'react';
import TailwindColors from '@config/tailwind/color';
import { MultiSelect } from '@fsd/shared/ui-kit';
import { ISelectProps } from './select.props';

export const Select: FC<ISelectProps> = ({ users, withOrphan, withPriority, limit = 1, ...props }) => {
	const data = useMemo(() => {
		const dataArr = users.map((user) => ({
			value: String(user.id),
			label: `${user.lastName} ${user.firstName}`,
			letters: user.lastName[0] + user.firstName[0],
			color: user.color,
			photo: user.photo,
		}));

		if (withPriority) {
			dataArr.unshift({
				value: '1',
				label: 'Приоритетные',
				letters: 'ПР',
				color: TailwindColors.warning[200],
				photo: '/system/priority.jpg',
			});
		}

		if (withOrphan) {
			dataArr.unshift({
				value: '0',
				label: 'Свободные',
				letters: 'ОК',
				color: TailwindColors.primary[100],
				photo: '/system/freedom.jpg',
			});
		}

		return dataArr;
	}, [users, withOrphan, withPriority]);

	return (
		<MultiSelect
			mode={'staff'}
			data={data}
			maxSelectedValues={limit !== 0 ? limit : undefined}
			searchable
			clearable
			{...props}
		/>
	);
};
