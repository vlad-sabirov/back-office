import { FC, useCallback, useEffect } from 'react';
import { useValidate } from './lib/use-validate';
import { IModalChangeUserIdProps } from './modal-change-user-id.types';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import { CrmOrganizationService, useCrmOrganizationGetCurrent } from '@fsd/entities/crm-organization';
import { StaffSelect } from '@fsd/entities/staff';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { HelperValidate } from '@fsd/shared/lib/validate';
import { Button, Modal, TextField } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { showNotification } from '@mantine/notifications';
import { Const } from '../../config/const';
import { useActions } from '../../lib/use-actions';
import { IInitFormChangeUserId } from '../../model/slice/org-card-info.slice.types';
import css from './modal-change-user-id.module.scss';

export const ModalChangeUserId: FC<IModalChangeUserIdProps> = () => {
	const usersSales = useStateSelector((state) => state.staff.data.sales);
	const usersTeam = useStateSelector((state) => state.staff.data.team);
	const current = useStateSelector((state) => state.crm_organization.data.current);
	const isLoading = useStateSelector((state) => state.crm_organization_card_info.isLoading);
	const isShowModal = useStateSelector((state) => state.crm_organization_card_info.modals.changeUserId);
	const formUserId = useStateSelector((state) => state.crm_organization_card_info.forms.changeUserId.userId);
	const errors = useStateSelector((state) => state.crm_organization_card_info.errors.changeUserId);
	const [updateOrganizationFetch] = CrmOrganizationService.updateById();
	const [createHistoryFetch] = CrmHistoryService.create();
	const actions = useActions();
	const validate = useValidate();
	const { user } = useUserDeprecated();
	const [getCurrent] = useCrmOrganizationGetCurrent();

	// Access
	const hasAccessChangeUserIdAdmin: boolean = useAccess({ access: Const.Access.ChangeUserId }) ?? false;
	const handleModalClose = useCallback(() => {
		actions.setModal(['changeUserId', false]);
	}, [actions]);

	const handleChangeForm = useCallback(
		(field: keyof IInitFormChangeUserId, value: string) => {
			actions.setFormChangeUserId({ [field]: value });
			actions.setErrorChangeUserId({ [field]: '' });
		},
		[actions]
	);

	useEffect(() => {
		if (isShowModal) {
			actions.setFormChangeUserId({
				userId: current?.userId ? String(current.userId) : '0',
			});
		}
	}, [actions, current, isShowModal]);

	const handleChangeUserId = useCallback(async () => {
		if (!current) {
			return;
		}
		actions.setLoading(true);

		if (!(await validate())) {
			actions.setLoading(false);
			return;
		}

		if (String(current.userId) !== formUserId) {
			const oldUser = !current.user
				? 'Свободные'
				: current.user.id === 1
				? 'Приоритетные'
				: `${current.user.lastName} ${current.user.firstName}`;
			const foundNewUser = usersSales.filter((user) => user.id == Number(formUserId))[0];
			const newUser = !foundNewUser
				? 'Свободные'
				: foundNewUser.id === 1
				? 'Приоритетные'
				: `${foundNewUser.lastName} ${foundNewUser.firstName}`;

			const response = await updateOrganizationFetch({
				id: current.id,
				updateDto: { userId: formUserId },
			});

			if ('error' in response) {
				actions.setLoading(false);
				showNotification({
					color: 'red',
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					message: response.error.data.message ?? 'Неизвестная ошибка, обратитесь в IT отдел',
				});
			}

			const responseHistory = await createHistoryFetch({
				organizationId: current.id,
				type: 'log',
				userId: user?.id ?? 1,
				payload:
					`${user?.lastName} ${user?.firstName} ${user?.sex === 'male' ? 'изменил' : 'изменила'}` +
					` ответственного с ${oldUser} на ${newUser}`,
				isSystem: true,
			});

			if ('error' in responseHistory) {
				actions.setLoading(false);
				showNotification({
					color: 'red',
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					message: responseHistory.error.data.message ?? 'Неизвестная ошибка, обратитесь в IT отдел',
				});
			}
		}

		handleModalClose();
		await getCurrent({ id: current.id });
		showNotification({ color: 'green', message: 'Ответственный изменен' });
		actions.setLoading(false);
	}, [
		actions,
		createHistoryFetch,
		current,
		formUserId,
		handleModalClose,
		updateOrganizationFetch,
		user,
		usersSales,
		validate,
		getCurrent,
	]);

	return (
		<Modal
			title={'Изменение ответственного'}
			onClose={handleModalClose}
			opened={isShowModal}
			loading={isLoading}
			size={480}
		>
			<TextField className={css.description} size={'small'}>
				В этом окне Вы можете изменить ответственного за организацию {current?.nameEn} ({current?.nameRu}).
				Организация не удаляется, а просто переходит во владение указанного сотрудника.
			</TextField>

			<StaffSelect
				label={'Ответственный'}
				value={[formUserId]}
				users={hasAccessChangeUserIdAdmin ? usersSales : usersTeam}
				onChange={(value) => handleChangeForm('userId', value[0])}
				error={errors.userId}
				withOrphan
				withPriority
				required
			/>

			<Modal.Buttons>
				<Button onClick={handleModalClose}> Отмена </Button>

				<Button
					color={'primary'}
					variant={'hard'}
					onClick={handleChangeUserId}
					disabled={!HelperValidate.isEmptyObject(errors)}
				>
					{' '}
					Сохранить{' '}
				</Button>
			</Modal.Buttons>
		</Modal>
	);
};
