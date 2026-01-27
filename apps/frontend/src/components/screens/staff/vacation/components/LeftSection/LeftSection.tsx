import { FC } from 'react';
import TailwindColors from '@config/tailwind/color';
import { Loader } from '@mantine/core';
import { Filter } from '../Filter';
import { LeftSectionProps } from '.';
import css from './left-section.module.scss';

export const LeftSection: FC<LeftSectionProps> = ({ isLoading, ...props }) => {
	return (
		<div className={css.wrapper} {...props}>
			<Filter />
			{isLoading && <Loader color={TailwindColors.neutral[100]} size="sm" />}
		</div>
	);
};
