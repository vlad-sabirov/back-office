import { FC, useState } from 'react';
import { LeftSectionProps } from './index';
import TailwindColors from '@config/tailwind/color';
import { Loader } from '@mantine/core';
import css from './left-section.module.scss';

export const LeftSection: FC<LeftSectionProps> = ({ ...props }) => {
	const [isLoading] = useState<boolean>(false);
	return (
		<div className={css.wrapper} {...props}>
			{isLoading && <Loader color={TailwindColors.neutral[100]} size="sm" />}
		</div>
	);
};
