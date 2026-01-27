import { StaffAvatar } from './modes';
import cn from 'classnames';
import { Avatar as MantineAvatar } from '@mantine/core';
import { AvatarProps } from './Avatar.props';
import css from './Styles.module.scss';

const Avatar = ({
	src,
	size = 'medium',
	onClick,
	color,
	text,
	className,
	disabled,
	...props
}: AvatarProps): JSX.Element => {
	const classNames = cn(
		{
			[css.root]: true,
			[css.sizeExtraSmall]: size === 'extraSmall',
			[css.sizeSmall]: size === 'small',
			[css.sizeMedium]: size === 'medium',
			[css.sizeLarge]: size === 'large',
			[css.sizeExtraLarge]: size === 'extraLarge',
		},
		className,
		{
			[css.disabled]: disabled,
		}
	);

	return (
		<MantineAvatar
			src={!src ? undefined : src.startsWith('blob:') ? src : '/api/static/' + src}
			{...props}
			sx={{
				backgroundColor: src ? color + ' !important' : 'transparent !important',
				'& > [class*="mantine-Avatar-placeholder"]': { backgroundColor: color + '33', color: color },
				'& [class*="mantine-Avatar-placeholderIcon"]': { color: color },
			}}
			className={classNames}
			onClick={onClick}
		>
			{text}
		</MantineAvatar>
	);
};

Avatar.Staff = StaffAvatar;
Avatar.displayName = 'Avatar';

export { Avatar };
