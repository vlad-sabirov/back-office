import { ComponentPropsWithoutRef, FC, forwardRef, useEffect, useState } from 'react';
import { IColors, IFormColorProps } from './form-color.types';
import { useDebounce } from '@fsd/shared/lib/hooks';
import { Select } from '@fsd/shared/ui-kit';
import { Badge } from '@mantine/core';

interface ItemProps extends ComponentPropsWithoutRef<'div'> {
	label: string;
	color?: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(({ color, label, ...others }: ItemProps, ref) => (
	<div ref={ref} {...others}>
		{!!color && (
			<Badge
				size={'xs'}
				color={color}
				variant={'outline'}
				style={{
					transform: 'translatey(3px)',
					width: 16,
					height: 16,
					marginRight: 6,
					borderWidth: 2,
					alignItems: 'end',
				}}
			/>
		)}
		{label}
	</div>
));
SelectItem.displayName = 'SelectItem';

export const FormColor: FC<IFormColorProps> = (props) => {
	const { value, error, required, onChange } = props;
	const [val, setVal] = useState<IColors>();

	useEffect(() => setVal(value), [value]);

	const handleChangeState = useDebounce(async (value: string) => {
		if (!onChange) {
			return;
		}
		onChange(value || '');
	}, 100);

	return (
		<Select
			label={'Цвет (приоритет)'}
			value={(val as string) ?? ''}
			onChange={(value) => {
				setVal(value as 'red');
				handleChangeState(value);
			}}
			itemComponent={SelectItem}
			data={[
				{ value: '', label: 'Без цвета' },
				{ value: 'green', label: 'Зеленый', color: 'green' },
				{ value: 'yellow', label: 'Желтый', color: 'yellow' },
				{ value: 'red', label: 'Красный', color: 'red' },
				{ value: 'purple', label: 'Фиолетовый', color: 'indigo' },
			]}
			error={error}
			required={required}
		/>
	);
};
