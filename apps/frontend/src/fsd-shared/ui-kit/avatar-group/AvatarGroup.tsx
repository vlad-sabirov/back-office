import cn from 'classnames';
import { Avatar, AvatarGroupProps } from '@fsd/shared/ui-kit';
import css from './Styles.module.scss';

export const AvatarGroup = ({
	size = 'medium',
	borderColor = 'white',
	limit,
	data,
	topPosition = 'right',
	className,
	...props
}: AvatarGroupProps): JSX.Element => {
	const itemClassNames = cn({
		[css.borderWhite]: borderColor === 'white',
		[css.borderGray]: borderColor === 'gray',
	});

	const rootClassNames = cn({
		[css.sizeExtraSmall]: size === 'extraSmall',
		[css.sizeSmall]: size === 'small',
		[css.sizeMedium]: size === 'medium',
		[css.sizeLarge]: size === 'large',
		[css.sizeExtraLarge]: size === 'extraLarge',
	});

	return (
		<div className={cn(css.root, rootClassNames, className)} {...props}>
			{data.length
				? data.map((avatar, index) => {
						if (index < limit)
							return (
								<div
									key={avatar.src}
									className={cn(css.item, itemClassNames)}
									style={{ zIndex:  topPosition === 'left' ? data.length - index : undefined }}
								>
									<Avatar
										src={avatar.src || undefined}
										color={avatar.color || undefined}
										text={avatar.text || undefined}
										size={size}
										style={{ zIndex:  topPosition === 'left' ? data.length - index : undefined }}
									/>
								</div>
							);
					})
				: null}

			{data.length && data.length > limit ? (
				<div className={cn(css.count, itemClassNames)}>
					<Avatar size={size} text={String(data.length)} />
				</div>
			) : null}
		</div>
	);
};
