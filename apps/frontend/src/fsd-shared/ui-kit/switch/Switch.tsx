import cn from 'classnames';
import { Switch as MantineSwitch } from '@mantine/core';
import { SwitchProps } from './Switch.props';
import cssRoot from './Switch.module.scss';
import cssColors from './styles/Colors.module.scss';
import cssSizes from './styles/Sizes.module.scss';
import cssStates from './styles/States.module.scss';

export const Switch = ({
	size = 'medium',
	color = 'neutral',
	className,
	disabled,
	...props
}: SwitchProps): JSX.Element => {
	const classNames = cn(
		cssRoot.root,
		{
			[cssSizes.small]: size === 'small',
			[cssSizes.medium]: size === 'medium',
			[cssSizes.large]: size === 'large',
		},
		{
			[cssColors.neutral]: color === 'neutral',
			[cssColors.primary]: color === 'primary',
		},
		className,
		{ [cssStates.disabled]: disabled }
	);

	return <MantineSwitch {...props} className={classNames} />;
};

Switch.displayName = 'Switch';
