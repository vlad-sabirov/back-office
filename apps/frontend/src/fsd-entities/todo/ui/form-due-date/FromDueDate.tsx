import { FC } from 'react';
import { IFormDueDateProps } from './form-due-date.types';
import { useValidation } from './use-validation';
import { format, parseISO } from 'date-fns';
import { DatePicker } from '@fsd/shared/ui-kit';

export const FormDueDate: FC<IFormDueDateProps> = (props) => {
	const { value, onChange, error, setError, required } = props;
	const validation = useValidation();

	const dueDate = () => {
		if (!value) return null;
		return parseISO(value) || new Date();
	};

	const handleChange = (date: Date | null) => {
		if (error) {
			setError(null);
		}

		if (!date) {
			onChange('');
			return;
		}

		onChange(format(date, 'yyyy-MM-dd') + 'T00:00:00Z');
	};

	const handleValidation = (val: Date | null) => {
		setError(null);
		const date = val ? format(val, 'yyyy-MM-dd') + 'T00:00:00Z' : '';
		validation({ value: date, setError, required });
	};

	return (
		<DatePicker
			value={dueDate()}
			onChange={(val) => {
				handleChange(val);
				handleValidation(val);
			}}
			label={'Дата выполнения'}
			error={error}
			required={required}
		/>
	);
};
