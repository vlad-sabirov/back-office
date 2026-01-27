import { ForwardedRef, forwardRef, useState } from 'react';
import cn from 'classnames';
import { Icon, InputNumberProps } from '@fsd/shared/ui-kit';
import { NumberInput } from '@mantine/core';
import css from './Styles.module.scss';
import { parsePhoneNumber } from '@helpers';

type NewType = ForwardedRef<HTMLInputElement>;

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(
	(
		{ mode = 'numbers', size = 'medium', variant = 'white', iconLeft, className, ...props }: InputNumberProps,
		ref: NewType
	): JSX.Element => {
		const [isFocused, setFocus] = useState<boolean>(false);
		const [value, setValue] = useState<number>(props.value as number);

		const classNames = cn(
			{
				[css.root]: true,
				[css.sizeMedium]: size === 'medium',
				[css.sizeLarge]: size === 'large',
				[css.variantWhite]: variant === 'white',
				[css.variantWhiteFilled]: variant === 'white' && !isFocused && value > 0,
				[css.variantWhiteFocused]: variant === 'white' && isFocused,
				[css.variantGray]: variant === 'gray',
				[css.variantGrayFilled]: variant === 'gray' && !isFocused && value > 0,
				[css.variantGrayFocused]: variant === 'gray' && isFocused,
				[css.error]: props.error,
				[css.errorFocused]: props.error && isFocused,
			},
			className,
			{ [css.disabled]: props.disabled }
		);

		if (mode === 'phone') {
			type Formatter = (value: string | undefined) => string;
			const formatter: Formatter = (value) => parsePhoneNumber(value || '').output;

			type Parser = (value: string | undefined) => string | undefined;
			const parser: Parser = (value) =>
				typeof value === 'string' ? value.replace(/\$\s?|( *)(-*)(\(*)(\)*)/g, '') : '';

			return (
				<NumberInput
					className={classNames}
					icon={<Icon name="phone-f" />}
					onFocus={() => setFocus(true)}
					onBlur={(event) => {
						setFocus(false);
						setValue(Number(event.currentTarget.value));
					}}
					{...props}
					formatter={formatter}
					parser={parser}
					hideControls={true}
					ref={ref}
				/>
			);
		}

		type Parser = (value: string | undefined) => string | undefined;
		const parser: Parser = (value) => (typeof value === 'string' ? value.replace(/\$\s?|( *)/g, '') : '');

		type Formatter = (value: string | undefined) => string;
		const formatter: Formatter = (value) => {
			if (typeof value !== 'string') return '';
			return !Number.isNaN(parseFloat(value)) ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
		};

		return (
			<NumberInput
				className={classNames}
				icon={iconLeft}
				parser={props.parser ? props.parser : parser}
				formatter={props.formatter ? props.formatter : formatter}
				onFocus={() => setFocus(true)}
				onBlur={(event) => {
					setFocus(false);
					setValue(Number(event.currentTarget.value));
				}}
				{...props}
				ref={ref}
			/>
		);
	}
);

InputNumber.displayName = 'InputNumber';
