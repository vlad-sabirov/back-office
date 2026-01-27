import { MultiSelect } from '@fsd/shared/ui-kit';
import { FC } from 'react';
import { MultiSelectUserProps } from '.';

export const MultiSelectUser: FC<MultiSelectUserProps> = ({ data, ...props }) => {
	return (
		<MultiSelect
			mode={'staff'}
			data={data.map((user) => ({
				value: String(user.id),
				label: `${user.lastName} ${user.firstName}`,
				letters: user.lastName[0] + user.firstName[0],
				color: user.color,
				photo: user.photo,
			}))}
			maxSelectedValues={props.maxSelectedValues ?? 1}
			searchable
			clearable
			{...props}
		/>
	);
};
