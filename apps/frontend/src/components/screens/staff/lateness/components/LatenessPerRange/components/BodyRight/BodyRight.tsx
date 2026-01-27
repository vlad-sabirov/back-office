import { FC } from 'react';
import { BodyRightSkeleton } from './body-right.skeleton';
import { Table, User } from './components';
import { BodyRightProps } from '.';

export const BodyRight: FC<BodyRightProps> = ({ data, onSuccess, ...props }) => {
	return data ? (
		<div {...props}>
			<User data={data} />
			<Table data={data} onSuccess={onSuccess} />
		</div>
	) : (
		<BodyRightSkeleton {...props} />
	);
};
