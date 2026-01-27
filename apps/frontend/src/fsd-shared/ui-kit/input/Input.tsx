import { ForwardedRef, forwardRef, useState } from 'react';
import cn from 'classnames';
import { PasswordInput, TextInput } from '@mantine/core';
import { InputProps } from './Input.props';
import css from './Styles.module.scss';

export const Input = forwardRef<HTMLInputElement, InputProps>(
	(
		{
			size = 'medium',
			variant = 'white',
			mode = 'text',
			iconLeft,
			iconRight,
			className,
			onFocus,
			onBlur,
			...props
		}: InputProps,
		ref: ForwardedRef<HTMLInputElement>
	): JSX.Element => {
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
				[css.variantDarkGray]: variant === 'darkGray',
				[css.variantDarkGrayFilled]: variant === 'darkGray' && !isFocused && value?.length > 0,
				[css.error]: props.error,
				[css.errorFocused]: props.error && isFocused,
			},
			className,
			{ [css.disabled]: props.disabled }
		);

		if (mode === 'password') {
			return (
				<PasswordInput
					className={classNames}
					icon={iconLeft}
					onFocus={(event) => {
						onFocus?.(event);
						setFocus(true)
					}}
					onBlur={(event) => {
						onBlur?.(event);
						setFocus(false);
						setValue(event.currentTarget.value);
					}}
					{...props}
					ref={ref}
				/>
			);
		}

		if (mode === 'phone') {
			return (
				<TextInput
					placeholder={'+998'}
					{...props}
					className={classNames}
					icon={iconLeft}
					rightSection={iconRight}
					onChange={(event) => {
						const value = event
							.currentTarget
							.value
							// eslint-disable-next-line no-useless-escape
							.replace(/[^0-9\+\-\(\)\s]/g, '')
							.trimStart();				
						setValue(value);
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						props.onChange?.(value as any);
					}}
					onFocus={(event) => {
						setFocus(true);
						onFocus?.(event);
					}}
					onBlur={(event) => {
						setFocus(false);
						setValue(event.currentTarget.value);
						onBlur?.(event);
					}}
					ref={ref}
				/>
			);
		}

		if (mode === 'email') {
			return (
				<TextInput
					placeholder={'mail@domain.com'}
					{...props}
					className={classNames}
					icon={iconLeft}
					rightSection={iconRight}
					onChange={(event) => {
						// Только символы доступные для почтового адреса
						const value = event.currentTarget.value.replace(/[^a-zA-Z0-9@._-]/g, '').toLocaleLowerCase();
						setValue(value);
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						props.onChange?.(value as any);
					}}
					onFocus={(event) => {
						setFocus(true);
						onFocus?.(event);
					}}
					onBlur={(event) => {
						setFocus(false);
						setValue(event.currentTarget.value);
						onBlur?.(event);
					}}
					ref={ref}
				/>
			);
		}

		return (
			<TextInput
				className={classNames}
				icon={iconLeft}
				rightSection={iconRight}
				onFocus={(event) => {
					onFocus?.(event);
					setFocus(true)
				}}
				onBlur={(event) => {
					onBlur?.(event);
					setFocus(false);
					setValue(event.currentTarget.value);
				}}
				{...props}
				ref={ref}
			/>
		);
	}
);

Input.displayName = 'Input';
