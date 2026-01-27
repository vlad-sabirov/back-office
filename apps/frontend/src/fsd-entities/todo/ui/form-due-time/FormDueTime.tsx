import { FC, useCallback, useMemo } from 'react';
import { IFormDueTimeProps } from './form-due-time.types';
import { format, parseISO, setHours, setMinutes } from 'date-fns';
import { Button, Icon, InputNumber } from '@fsd/shared/ui-kit';
import { Popover } from '@mantine/core';
import css from './form-due-time.module.scss';

export const FormDueTime: FC<IFormDueTimeProps> = (props) => {
	const { value, onChange } = props;

	const dueTime = useMemo<{ h: string; m: string } | null>(() => {
		if (!value) return null;
		const date = parseISO(value);
		return { h: format(date, 'HH'), m: format(date, 'mm') };
	}, [value]);

	const handleChangeHours = useCallback(
		(val: number | undefined) => {
			const date = parseISO(value);
			if (!val) {
				onChange(format(date, 'yyyy-MM-dd') + 'T00:00:00Z');
				return;
			}
			const newDate = setHours(date, val ?? 0);
			onChange(format(newDate, 'yyyy-MM-dd') + 'T' + format(newDate, 'HH:mm:ssXXX'));
		},
		[onChange, value]
	);

	const handleChangeMinutes = useCallback(
		(val: number | undefined) => {
			const date = parseISO(value);
			const newDate = setMinutes(date, val ?? 0);
			onChange(format(newDate, 'yyyy-MM-dd') + 'T' + format(newDate, 'HH:mm:ssXXX'));
		},
		[onChange, value]
	);

	return (
		<Popover withArrow radius={'md'} shadow={'xl'} disabled={value === ''}>
			<Popover.Target>
				<Button
					iconLeft={<Icon name={'calendar'} />}
					color={dueTime && Number(dueTime.h) >= 7 && dueTime.m !== '0' ? 'primary' : 'neutral'}
					size={'small'}
					disabled={value === ''}
				>
					Время
				</Button>
			</Popover.Target>
			<Popover.Dropdown>
				<div className={css.wrapper}>
					<InputNumber
						label={'Час'}
						min={7}
						max={22}
						value={dueTime?.h && Number(dueTime.h) < 7 ? undefined : Number(dueTime?.h)}
						onChange={handleChangeHours}
					/>
					<InputNumber
						label={'Мин'}
						min={0}
						step={5}
						max={59}
						disabled={!!dueTime?.h && Number(dueTime.h) < 7}
						value={dueTime?.m && Number(dueTime?.m) > 0 ? Number(dueTime?.m) : undefined}
						onChange={handleChangeMinutes}
					/>
				</div>
			</Popover.Dropdown>
		</Popover>
	);
};
