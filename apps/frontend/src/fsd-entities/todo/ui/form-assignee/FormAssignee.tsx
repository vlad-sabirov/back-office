import { FC, useCallback } from 'react';
import { IFormAssigneeProps } from './form-assignee.types';
import { StaffSelect } from '@fsd/entities/staff';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon } from '@fsd/shared/ui-kit';
import css from '@fsd/widgets/todo-create-modal/ui/_create-modal/create-modal.module.scss';
import { Popover } from '@mantine/core';

export const FormAssignee: FC<IFormAssigneeProps> = (props) => {
	const { value, onChange, setError, error } = props;
	const users = useStateSelector((state) => state.staff.data.worked);

	const handleChange = useCallback(
		(val: string[]) => {
			if (error) {
				setError(null);
			}

			if (!val.length) {
				onChange(0);
				return;
			}
			onChange(Number(val[0]));
		},
		[error, onChange, setError]
	);

	return (
		<Popover withArrow radius={'md'} shadow={'xl'}>
			<Popover.Target>
				<Button iconLeft={<Icon name={'calendar'} />} color={value ? 'primary' : 'neutral'} size={'small'}>
					Ответственный
				</Button>
			</Popover.Target>
			<Popover.Dropdown>
				<div className={css.assignee}>
					<StaffSelect
						label={'Ответственный'}
						users={users}
						value={value ? [String(value)] : undefined}
						onChange={handleChange}
						error={error}
					/>
				</div>
			</Popover.Dropdown>
		</Popover>
	);
};
