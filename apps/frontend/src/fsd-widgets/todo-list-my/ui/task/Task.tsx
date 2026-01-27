import { FC, useMemo } from 'react';
import cn from 'classnames';
import { isBefore, isToday, parseISO } from 'date-fns';
import { useCrmContactGetByID } from '@fsd/entities/crm-contact';
import { useCrmOrganizationGetByID } from '@fsd/entities/crm-organization';
import { useTodoActions, useTodoCheckTask } from '@fsd/entities/todo';
import { DateToString } from '@fsd/shared/lib/date-to-string';
import { Icon, TextField } from '@fsd/shared/ui-kit';
import { Checkbox } from '@mantine/core';
import { ITaskProps } from './task.props';
import css from './task.module.scss';

export const Task: FC<ITaskProps> = (props) => {
	const { task, onClickToTask } = props;
	const getOrgByID = useCrmOrganizationGetByID();
	const getContByID = useCrmContactGetByID();
	const todoActions = useTodoActions();
	const taskCheck = useTodoCheckTask();

	todoActions.setIsLoading(true);

	const contact: string | null = useMemo(() => {
		if (task.organization_id) {
			const org = getOrgByID(task.organization_id);
			return org ? org.nameEn : null;
		}

		if (task.contact_id) {
			const cont = getContByID(task.contact_id);
			return cont ? cont.name : null;
		}

		return null;
	}, [getContByID, getOrgByID, task.contact_id, task.organization_id]);

	const date = useMemo<string>(() => DateToString(parseISO(task.due_date)), [task]);
	const isArrived = useMemo<boolean>(() => {
		const date = parseISO(task.due_date);
		const before = isBefore(parseISO(task.due_date), new Date());
		const zeroHours = date.getUTCHours() === 0;
		const today = isToday(date);

		if (today && zeroHours) {
			return false;
		}

		return before;
	}, [task.due_date]);

	const handleTaskCheck = async (task_id: string, is_checked: boolean) => {
		await taskCheck(task_id, is_checked);
	};

	return (
		<div className={cn(css.root)}>
			<div>
				<Checkbox
					// checked={task.is_done}
					onClick={(e) => {
						handleTaskCheck(task.id, e.currentTarget.checked);
					}}
				/>
			</div>

			<div
				onClick={() => {
					todoActions.setDataCurrent(task);
					todoActions.setModalShow({ modal: 'info', show: true });
					onClickToTask();
				}}
			>
				<TextField className={cn(css.name, { [css.nameArrived]: isArrived })} size={'small'}>
					{task.name}
				</TextField>

				<div className={css.bottom}>
					<TextField className={cn(css.date, { [css.dateArrived]: isArrived })} size={'small'}>
						<Icon name={'calendar'} />
						{date}
					</TextField>

					{contact && (
						<TextField className={cn(css.pick, { [css.pickArrived]: isArrived })} size={'small'}>
							<Icon name={'user'} />
							{contact}
						</TextField>
					)}
				</div>
			</div>
		</div>
	);
};
