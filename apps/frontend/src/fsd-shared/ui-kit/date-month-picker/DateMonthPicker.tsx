import { ForwardedRef, forwardRef, useEffect, useState } from 'react';
import cn from 'classnames';
import { format, parse } from 'date-fns';
import Calendar from 'react-calendar';
import { Icon, Input } from '@fsd/shared/ui-kit';
import { customLocaleRu } from '@config/date-fns.locale';
import { Popover } from '@mantine/core';
import DateMonthPickerProps from './DateMonthPicker.props';
import css from './styles.module.scss';

export const DateMonthPicker = forwardRef<HTMLInputElement, DateMonthPickerProps>(
	(
		{
			size = 'medium',
			variant = 'white',
			label,
			defaultValue,
			value,
			onChange,
			error,
			required,
			disabled,
			className,
			target,
			...props
		}: DateMonthPickerProps,
		ref: ForwardedRef<HTMLInputElement>
	): JSX.Element => {
		const [opened, setOpened] = useState<boolean>(false);
		const [date, setDate] = useState<Date | undefined>(
			value?.year && value.month
				? parse(`${value.year}-${value.month}`, 'yyyy-MM', new Date())
				: defaultValue?.year && defaultValue.month
				? parse(`${defaultValue.year}-${defaultValue.month}`, 'yyyy-MM', new Date())
				: undefined
		);

		const onChangeValue = (date: Date) => {
			const changeValue = { year: format(date, 'yyyy'), month: format(date, 'MM') };
			onChange?.(changeValue);
			setDate(date);
			setOpened(false);
		};

		useEffect(() => {
			setDate(
				value?.year && value.month
					? parse(`${value.year}-${value.month}`, 'yyyy-MM', new Date())
					: defaultValue?.year && defaultValue.month
					? parse(`${defaultValue.year}-${defaultValue.month}`, 'yyyy-MM', new Date())
					: undefined
			);
		}, [defaultValue, value]);

		const classInputWrapper = cn(css.input__wrapper, className);

		return (
			<Popover
				opened={opened}
				onClose={() => setOpened(false)}
				width={280}
				position="bottom"
				withArrow
				radius="md"
				offset={-5}
			>
				<Popover.Target>
					<div className={classInputWrapper} style={{ pointerEvents: disabled ? 'none' : undefined }}>
						{target ? (
							<div onClick={() => setOpened(true)}>{target}</div>
						) : (
							<>
								<Input
									iconLeft={<Icon name="calendar" />}
									onClick={() => setOpened(true)}
									value={date ? format(date, 'yyyy, LLLL', { locale: customLocaleRu }) : undefined}
									onChange={() => null}
									size={size}
									variant={variant}
									className={cn(css.input)}
									disabled={disabled}
									required={required}
									label={label}
									error={error}
									readOnly={true}
									autoComplete="off"
									aria-invalid="false"
									ref={ref}
								/>
							</>
						)}
					</div>
				</Popover.Target>
				<Popover.Dropdown>
					<div style={{ display: 'flex' }}>
						<Calendar
							onChange={onChangeValue}
							minDetail="year"
							maxDetail="year"
							value={date ? date : undefined}
							locale="ru-RU"
							className={css.root}
							prevLabel={<Icon name="arrow-medium" />}
							nextLabel={<Icon name="arrow-medium" />}
							{...props}
						/>
					</div>
				</Popover.Dropdown>
			</Popover>
		);
	}
);

DateMonthPicker.displayName = 'DateMonthPicker';
