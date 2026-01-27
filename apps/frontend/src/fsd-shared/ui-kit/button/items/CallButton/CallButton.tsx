import { FC } from 'react';
import cn from 'classnames';
import { Button, Icon, Menu } from '@fsd/shared/ui-kit';
import { Tooltip } from '@mantine/core';
import { CallButtonProps } from './props';
import css from './styles.module.scss';
import { MenuItemStaffCall } from '@fsd/shared/ui-kit/menu/items';

export const CallButton: FC<CallButtonProps> = (props) => {
	const { className, color, variant, size, phoneMobile, phoneVoip, ...otherProps } = props;

	const classNames = cn(
		{
			[css.sizeSmall]: size === 'small',
			[css.sizeMedium]: !size || size === 'medium',
			[css.sizeLarge]: size === 'large',
			[css.sizeExtraLarge]: size === 'extraLarge',
		},
		className
	);

	return (
		<Menu
			offset={-12}
			control={
				<Tooltip label={'Позвонить'} withArrow openDelay={1000} transitionDuration={300} position="top-end">
					<div>
						<Button
							className={classNames}
							color={color || 'primary'}
							variant={variant || 'easy'}
							size={size || 'medium'}
							{...otherProps}
						>
							<Icon name="phone-f" />
						</Button>
					</div>
				</Tooltip>
			}
		>
			{!!phoneVoip && <MenuItemStaffCall mode="voip" phone={Number(phoneVoip)} />}
			{!!phoneMobile && <MenuItemStaffCall mode="mobile" phone={Number(phoneMobile)} />}
		</Menu>
	);
};
