import { forwardRef, useState } from 'react';
import cn from 'classnames';
import OtpInput from 'react-otp-input';
import { TextField } from '@fsd/shared/ui-kit';
import { InputOtpProps, LegacyRef } from './props';
import css from './styles.module.scss';

export const InputOtp = forwardRef<OtpInput, InputOtpProps>(
	(
		{ length = 4, size = 'medium', onChange, error, className, ...props }: InputOtpProps,
		ref: LegacyRef<OtpInput>
	): JSX.Element => {
		const [isFocused] = useState<boolean>(false);
		const [value, setValue] = useState<string>('');

		const classNames = cn(
			{
				[css.root]: true,
				[css.sizeSmall]: size === 'small',
				[css.sizeMedium]: size === 'medium',
				[css.sizeLarge]: size === 'large',
				[css.variantWhiteFilled]: !isFocused && props.value,
				[css.variantWhiteFocused]: isFocused,
				[css.error]: error,
				[css.errorFocused]: error && isFocused,
			},
			className,
			{ [css.disabled]: props.disabled }
		);

		return (
			<div className={classNames}>
				<OtpInput
					isInputNum={true}
					numInputs={length}
					value={value}
					onChange={(event: string) => {
						onChange?.(event);
						setValue(event);
					}}
					{...props}
					ref={ref}
				/>
				<TextField className={css.error}>{error ? error : null}</TextField>
			</div>
		);
	}
);

InputOtp.displayName = 'InputOtp';
