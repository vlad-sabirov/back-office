import { useCallback, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
	CrmContactConst,
	CrmContactService,
	useCrmContactActions,
	useCrmContactGetCurrent,
} from '@fsd/entities/crm-contact';
import { CrmContactModalEdit, CrmContactModalUserId } from '@fsd/entities/crm-contact';
import { CrmCardEmails } from '@fsd/entities/crm-email';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import { CrmCardPhones } from '@fsd/entities/crm-phone';
import { dateFnsLocaleRu } from '@fsd/shared/lib/date-fns.ru.locale';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { TextField } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { showNotification } from '@mantine/notifications';
import css from './contact-info.module.scss';

export const ContactInfo = () => {
	const current = useStateSelector((state) => state.crm_contact.data.current);
	const staffSales = useStateSelector((state) => state.staff.data.sales);
	const [changeUserIdModal, setChangeUserIdModal] = useState<boolean>(false);
	const [changeUserIdLoading, setChangeUserIdLoading] = useState<boolean>(false);
	const [editModal, setEditModal] = useState<boolean>(false);
	const team = useStateSelector((state) => state.app.auth.team);
	const CheckAccessChangeUserId = useAccess({ access: CrmContactConst.Access.ChangeUserId });
	const [fetchEdit] = CrmContactService.edit();
	const [createHistory] = CrmHistoryService.create();
	const { user } = useUserDeprecated();
	const contactActions = useCrmContactActions();
	const [getCurrent] = useCrmContactGetCurrent();

	const isAccessChangeUserId = useMemo(() => {
		return (
			CheckAccessChangeUserId ||
			(team && team.length > 1 && team.some((teamUserId) => teamUserId == current?.userId ?? 0))
		);
	}, [CheckAccessChangeUserId, current?.userId, team]);

	const handleChangeUserId = useCallback(
		async (response: string) => {
			if (!current) {
				return;
			}
			setChangeUserIdLoading(true);
			try {
				const newUser = staffSales.find((user) => user.id === Number(response));
				let valueString = `Изменил${user?.sex === 'female' ? 'а' : ''} ответственного`;
				valueString += ` с ${current.user?.lastName} ${current.user?.firstName}`;
				valueString += ` на ${newUser?.lastName} ${newUser?.firstName},`;
				valueString += ` для контакта ${current.name}.`;

				await fetchEdit({
					id: current.id,
					updateDto: { userId: response },
				});

				createHistory({
					userId: String(user?.id ?? 0),
					contactId: current?.id || 0,
					payload: valueString,
					type: 'log',
					isSystem: true,
				});
			} catch {
				// ошибка обработана — уведомление показывается ниже
			}
			setChangeUserIdLoading(false);

			showNotification({
				color: 'green',
				message: 'Информация сохранена',
			});
			setChangeUserIdModal(false);
		},
		[createHistory, current, fetchEdit, staffSales, user?.id, user?.sex]
	);

	const handleEdit = useCallback(async () => {
		getCurrent({ id: current?.id ?? 0 });
		setEditModal(false);
		showNotification({
			color: 'green',
			message: 'Информация сохранена',
		});
	}, [current?.id, getCurrent]);

	if (!current) return <></>;
	return (
		<>
			<div className={css.wrapper}>
				{isAccessChangeUserId && (
					<TextField className={css.userId}>
						Ответственный:{' '}
						<span onClick={() => setChangeUserIdModal(true)}>
							{' '}
							{!current.user?.id ? (
								<>Свободные</>
							) : current.user.id === 1 ? (
								<>Приоритетные</>
							) : (
								<>
									{current.user.lastName} {current.user.firstName}
								</>
							)}
						</span>
					</TextField>
				)}

				<TextField className={css.workPosition}>
					Должность: <span>{current.workPosition}</span>
				</TextField>

				{!!current.birthday && (
					<TextField className={css.birthday}>
						День рождения:{' '}
						<span>{format(parseISO(current.birthday), 'dd MMMM yyyy', { locale: dateFnsLocaleRu })}</span>
					</TextField>
				)}

				<CrmCardPhones phones={current.phones} name={current.name} />
				<CrmCardEmails emails={current.emails} />

				{!!current.comment && (
					<TextField className={css.comment}>
						Комментарий: <br />
						{current.comment}
					</TextField>
				)}

				<TextField
					className={css.action}
					onClick={() => {
						setEditModal(true);
						contactActions.setFormEditCurrent();
					}}
				>
					{' '}
					изменить{' '}
				</TextField>
			</div>

			<CrmContactModalEdit isShow={editModal} setIsShow={setEditModal} onSuccess={handleEdit} />

			<CrmContactModalUserId
				isShow={changeUserIdModal}
				isLoading={changeUserIdLoading}
				setIsShow={setChangeUserIdModal}
				onSuccess={handleChangeUserId}
			/>
		</>
	);
};
