import { Icon, IconPropsNames } from '@fsd/shared/ui-kit';
import cn from 'classnames';
import { FC } from 'react';
import { IconCrmBatteryProps } from '.';
import css from './icon-crm-battery.module.scss';

export const IconCrmBattery: FC<IconCrmBatteryProps> = ({ level, className, onClick }) => {
	let name: typeof IconPropsNames[number] = 'battery-empty';
	if (level === 'empty') name = 'battery-empty';
	if (level === 'low') name = 'battery-low';
	if (level === 'medium') name = 'battery-medium';
	if (level === 'full') name = 'battery-full';

	return (<>
		<Icon
			name={name}
			className={cn({
				[css.empty]: level === 'empty',
				[css.low]: level === 'low',
				[css.medium]: level === 'medium',
				[css.full]: level === 'full',
			}, className)}
			onClick={onClick}
		/>
	</>);
};
