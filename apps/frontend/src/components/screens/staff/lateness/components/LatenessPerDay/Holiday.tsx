import { FC } from 'react';
import cn from 'classnames';
import { TextField } from '@fsd/shared/ui-kit';
import HolidaySvg from '@public/img/holiday.svg';
import { LatenessPerDayProps } from '.';
import css from './holiday.module.scss';

export const Holiday: FC<LatenessPerDayProps> = ({ className, ...props }) => {
	return (
		<div className={cn(css.wrapper, className)} {...props}>
			<div>
				<HolidaySvg className={css.icon} />
				<TextField mode={'heading'} size={'small'} className={css.text}>
					Праздничный день
				</TextField>
			</div>
		</div>
	);
};
