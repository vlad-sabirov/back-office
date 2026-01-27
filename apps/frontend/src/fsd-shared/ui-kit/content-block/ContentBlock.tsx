import cn from 'classnames';
import { ContentBlockProps, TextField } from '@fsd/shared/ui-kit';
import { forwardRef } from "react";
import css from './Styles.layout.module.scss';
import { Loader } from '@mantine/core';
import TailwindColors from '@config/tailwind/color';

export const ContentBlock = forwardRef<HTMLDivElement, ContentBlockProps>(({
	title,
	children,
	width,
	height,
	withoutPaddingX,
	withoutPaddingY,
	className,
	loading,
	...props
}, ref) => {
	const classNames = cn(css.wrapper, {
		[css.withoutPaddingX]: withoutPaddingX,
		[css.withoutPaddingY]: withoutPaddingY,
	});

	return (
		<div className={cn(css.root, className)} {...props} ref={ref}>
			{typeof title !== 'undefined' && (
				<TextField mode="heading" size="small">
					{title}
				</TextField>
			)}
			<div
				className={cn({ [css.loading]: loading }, classNames)}
				style={{ height: height, width: width }}
			>
				{loading && <Loader color={TailwindColors.primary.main} className={css.loader} size='lg' />}
				{children}
			</div>
		</div>
	);
});
ContentBlock.displayName = 'ContentBlock';
