import { FC } from 'react';
import { Filter } from '../';
import { LeftSectionProps } from '.';

export const LeftSection: FC<LeftSectionProps> = ({ className, ...props }) => {
	return (
		<div className={className} {...props}>
			<Filter />
		</div>
	);
};
