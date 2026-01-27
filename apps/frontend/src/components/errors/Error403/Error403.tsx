import { FC } from 'react';
import Icon403 from './assets/403.svg';
import { Error403Props } from '.';
import css from './error-403.module.scss';

export const Error403: FC<Error403Props> = ({ ...props }) => {
	return (
		<div className={css.wrapper} {...props}>
			<Icon403 />
		</div>
	);
};
