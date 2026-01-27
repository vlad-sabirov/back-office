import { FC, useCallback } from 'react';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import { CrmOrganizationService, useCrmOrganizationGetCurrent } from '@fsd/entities/crm-organization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { showNotification } from '@mantine/notifications';
import { useActions } from '../../lib/use-actions';
import css from './modal-to-priority.module.scss';

export const ModalToPriority: FC = () => {
	const current = useStateSelector((state) => state.crm_organization.data.current);
	const isShowModal = useStateSelector((state) => state.crm_organization_card_info.modals.toPriority);
	const isLoading = useStateSelector((state) => state.crm_organization_card_info.isLoading);
	const actions = useActions();
	const [updateFetch] = CrmOrganizationService.updateById();
	const [crateHistoryFetch] = CrmHistoryService.create();
	const { userId } = useUserDeprecated();
	const [getCurrentFetch] = useCrmOrganizationGetCurrent();

	const handleModalClose = useCallback(() => {
		actions.setModal(['toPriority', false]);
	}, [actions]);

	const handleToPriority = async () => {
		if (!current?.id || !userId) {
			return;
		}

		actions.setLoading(true);
		const response = await updateFetch({ id: current.id, updateDto: { isVerified: true, userId: 1 } });
		if ('error' in response) {
			showNotification({
				color: 'red',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				message: response.error.data.message ?? 'Неизвестная ошибка, обратитесь в IT отдел',
			});
			return;
		}

		let message = `Организация ${current.nameEn} (${current.nameRu}) отправлена в приоритетные`;
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
			message: 'Организация перенесена в приоритетные',
		});
		actions.setLoading(false);
		handleModalClose();
	};

	return (
		<Modal
			title={'Отправить в приоритетные?'}
			opened={isShowModal}
			onClose={handleModalClose}
			loading={isLoading}
			size={520}
		>
			<TextField className={css.info} size={'large'}>
				Важно!
			</TextField>
			<TextField className={css.description}>
				Если Вы отправите организацию в приоритетные, то ответственный изменится и организация не будет
				принадлежать сотруднику который ее оформил.
			</TextField>

			<Modal.Buttons>
				<Button onClick={handleModalClose}> Отмена </Button>

				<Button
					color={'warning'}
					variant={'hard'}
					type={'submit'}
					iconLeft={<Icon name={'crm-filter-priority'} />}
					onClick={handleToPriority}
				>
					Отправить в приоритетные
				</Button>
			</Modal.Buttons>
		</Modal>
	);
};
