import { forwardRef } from 'react';
import cn from 'classnames';
import { TextFieldProps } from './TextField.props';
import css from './Styles.module.scss';

export const TextField = forwardRef<HTMLParagraphElement, TextFieldProps>(
	({ size = 'medium', mode = 'paragraph', disabled = false, children, className, ...props }, ref) => {
		const classNames = cn(
			{
				[css.root]: true,
				[css.mode__paragraph__small]: mode === 'paragraph' && size === 'small',
				[css.mode__paragraph__medium]: mode === 'paragraph' && size === 'medium',
				[css.mode__paragraph__large]: mode === 'paragraph' && size === 'large',
				[css.mode__heading__small]: mode === 'heading' && size === 'small',
				[css.mode__heading__medium]: mode === 'heading' && size === 'medium',
				[css.mode__heading__large]: mode === 'heading' && size === 'large',
			},
			className,
			{ [css.disabled]: disabled }
		);

		if (mode === 'heading') {
			return (
				<h2 className={classNames} {...props} ref={ref}>
					{children}
				</h2>
			);
		}

		if (mode === 'paragraph') {
			return (
				<p className={classNames} {...props} ref={ref}>
					{children}
				</p>
			);
		}

		return <></>;
	}
);
TextField.displayName = 'TextField';
