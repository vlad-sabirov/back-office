import { forwardRef, useState } from 'react';
import cn from 'classnames';
import { TextareaProps } from '@fsd/shared/ui-kit';
import { Textarea as MantineTextarea } from '@mantine/core';
import css from './Styles.module.scss';

export const Textarea = forwardRef<HTMLInputElement, TextareaProps>(
	({ size = 'medium', variant = 'white', className, ...props }: TextareaProps, ref): JSX.Element => {
		const [isFocused, setFocus] = useState<boolean>(false);
		const [value, setValue] = useState<string>(props.value as string);

		const classNames = cn(
			{
				[css.root]: true,
				[css.sizeMedium]: size === 'medium',
				[css.sizeLarge]: size === 'large',
				[css.variantWhite]: variant === 'white',
				[css.variantWhiteFilled]: variant === 'white' && !isFocused && value?.length > 0,
				[css.variantWhiteFocused]: variant === 'white' && isFocused,
				[css.variantGray]: variant === 'gray',
				[css.variantGrayFilled]: variant === 'gray' && !isFocused && value?.length > 0,
				[css.variantGrayFocused]: variant === 'gray' && isFocused,
				[css.error]: props.error,
				[css.errorFocused]: props.error && isFocused,
			},
			className,
			{ [css.disabled]: props.disabled }
		);

		return (
			<MantineTextarea
				className={classNames}
				onFocus={() => setFocus(true)}
				onBlur={(event) => {
					setFocus(false);
					setValue(event.currentTarget.value);
				}}
				{...props}
				{...ref}
			/>
		);
	}
);

Textarea.displayName = 'Textarea';
