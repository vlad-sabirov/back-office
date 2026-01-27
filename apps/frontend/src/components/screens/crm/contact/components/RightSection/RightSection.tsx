import { FC } from 'react';
import { RightSectionProps } from '.';
import css from './right-section.module.scss';

export const RightSection: FC<RightSectionProps> = ({ ...props }) => {
	return <div className={css.wrapper} {...props}></div>;
};
