import { FC, useCallback } from 'react';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import { CrmOrganizationService, useCrmOrganizationGetCurrent } from '@fsd/entities/crm-organization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { showNotification } from '@mantine/notifications';
import { useActions } from '../../lib/use-actions';
import css from './modal-to-verified.module.scss';

export const ModalToVerified: FC = () => {
	const current = useStateSelector((state) => state.crm_organization.data.current);
	const isShowModal = useStateSelector((state) => state.crm_organization_card_info.modals.toVerified);
	const isLoading = useStateSelector((state) => state.crm_organization_card_info.isLoading);
	const actions = useActions();
	const [updateFetch] = CrmOrganizationService.updateById();
	const [crateHistoryFetch] = CrmHistoryService.create();
	const { userId } = useUserDeprecated();
	const [getCurrentFetch] = useCrmOrganizationGetCurrent();

	const handleModalClose = useCallback(() => {
		actions.setModal(['toVerified', false]);
	}, [actions]);

	const handleToVerify = async () => {
		if (!current?.id || !userId) {
			return;
		}

		actions.setLoading(true);
		const response = await updateFetch({ id: current.id, updateDto: { isVerified: true } });
		if ('error' in response) {
			showNotification({
				color: 'red',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				message: response.error.data.message ?? 'Неизвестная ошибка, обратитесь в IT отдел',
			});
			return;
		}

		let message = `Организация ${current.nameEn} (${current.nameRu}) одобрена`;
		message += '.';
		await crateHistoryFetch({
			isSystem: true,
			type: 'log',
			userId: userId,
			organizationId: current.id,
			payload: message,
		});
		getCurrentFetch({ id: current.id });

		showNotification({
			color: 'green',
			message: 'Организация одобрена',
		});
		actions.setLoading(false);
		handleModalClose();
	};

	return (
		<Modal title={'Подтвердить?'} opened={isShowModal} onClose={handleModalClose} loading={isLoading} size={520}>
			<TextField className={css.info} size={'large'}>
				Важно!
			</TextField>
			<TextField className={css.description}>
				Вы уверены что организация оформлена корректно? Проверьте все ли поля заполнены корректно. Важно чтобы
				для организации указывали данные организации, а не контакта. Если есть что дополнить, то лучше попросить
				сотрудника дополнить информацию.
			</TextField>

			<Modal.Buttons>
				<Button onClick={handleModalClose}> Отмена </Button>

				<Button
					color={'success'}
					variant={'hard'}
					type={'submit'}
					iconLeft={<Icon name={'checkbox'} />}
					onClick={handleToVerify}
				>
					Подтвердить сотруднику
				</Button>
			</Modal.Buttons>
		</Modal>
	);
};
