import { FC, useState } from 'react';
import TailwindColors from '@config/tailwind/color';
import { Loader } from '@mantine/core';
import { LeftSectionProps } from '.';
import css from './left-section.module.scss';

export const LeftSection: FC<LeftSectionProps> = ({ ...props }) => {
	// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
	const [isLoading, setIsLoading] = useState<boolean>(false);

	return (
		<div className={css.wrapper} {...props}>
			{isLoading && <Loader color={TailwindColors.neutral[100]} size='sm' />}
		</div>
	);
};
