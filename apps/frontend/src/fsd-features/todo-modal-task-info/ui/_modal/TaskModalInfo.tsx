import { FC, useMemo } from 'react';
import cn from 'classnames';
import { format, isBefore, parseISO } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { useCrmContactGetByID } from '@fsd/entities/crm-contact';
import { useCrmOrganizationGetByID } from '@fsd/entities/crm-organization';
import { StaffAvatar } from '@fsd/entities/staff';
import { useTodoActions } from '@fsd/entities/todo';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { Checkbox } from '@mantine/core';
import css from './task-modal-info.module.scss';

export const TaskModalInfo: FC = () => {
	const actions = useTodoActions();
	const isShow = useStateSelector((state) => state.todo.modals.info);
	const task = useStateSelector((state) => state.todo.data.current);
	const staff = useStateSelector((state) => state.staff.data.all);

	const getOrgByID = useCrmOrganizationGetByID();
	const getContByID = useCrmContactGetByID();

	const [organization, contact] = useMemo(() => {
		if (!task) {
			return [null, null];
		}
		const org = getOrgByID(task.organization_id);
		const cont = getContByID(task.contact_id);
		return [org, cont];
	}, [getContByID, getOrgByID, task]);

	const handleClose = () => {
		actions.setModalShow({ modal: 'info', show: false });
	};

	const [dueDate, dueTime] = useMemo(() => {
		if (!task?.due_date) {
			return ['', ''];
		}
		const due_date = parseISO(task.due_date);
		const date = format(due_date, 'd MMMM', { locale: customLocaleRu });
		const time = format(due_date, 'HH:mm', { locale: customLocaleRu });
		return [date, time];
	}, [task?.due_date]);

	const assignedUser = useMemo(() => {
		if (!task?.assignee_id) {
			return null;
		}
		return staff.find((user) => user.id === task.assignee_id);
	}, [staff, task?.assignee_id]);

	const isArrived = useMemo<boolean>(() => isBefore(parseISO(task?.due_date ?? ''), new Date()), [task?.due_date]);

	return (
		<Modal title={'Задача'} opened={isShow} onClose={handleClose} size={360}>
			<div className={css.nameWrapper}>
				<Checkbox label={task?.name} className={css.name} />
			</div>

			<TextField className={css.description} size={'small'}>
				{task?.description}
			</TextField>

			<div className={css.dueDateWrapper}>
				<TextField className={cn(css.dueDate, { [css.dueDateArrived]: isArrived })} size={'small'}>
					<Icon name={'calendar'} />
					{dueDate}
				</TextField>

				{dueTime !== '05:00' ? (
					<TextField className={cn(css.dueDate, { [css.dueDateArrived]: isArrived })} size={'small'}>
						<Icon name={'time'} />
						{dueTime}
					</TextField>
				) : (
					<div></div>
				)}

				{assignedUser && <StaffAvatar user={assignedUser} size={'small'} />}
			</div>

			<div className={css.pick}>
				<Icon name={'link'} className={css.pickIcon} />

				{organization && (
					<TextField className={css.pickText} size={'small'}>
						{organization.nameEn} ({organization.nameRu})
					</TextField>
				)}

				{contact && (
					<TextField className={css.pickText} size={'small'}>
						{contact.name}
					</TextField>
				)}
			</div>

			<div className={css.buttons}>
				<div></div>
				<Button iconLeft={<Icon name={'edit'} />}>Изменить</Button>

				<Button iconLeft={<Icon name={'trash'} />} color={'error'} variant={'hard'}>
					Удалить
				</Button>
			</div>
		</Modal>
	);
};
