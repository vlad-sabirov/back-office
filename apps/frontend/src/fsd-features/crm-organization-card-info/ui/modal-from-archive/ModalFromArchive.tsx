import { FC, useCallback, useState } from 'react';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import { CrmOrganizationService, useCrmOrganizationGetCurrent } from '@fsd/entities/crm-organization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Modal, TextField, Textarea } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { showNotification } from '@mantine/notifications';
import { useActions } from '../../lib/use-actions';
import css from './modal-to-archive.module.scss';

export const ModalFromArchive: FC = () => {
	const current = useStateSelector((state) => state.crm_organization.data.current);
	const isShowModal = useStateSelector((state) => state.crm_organization_card_info.modals.fromArchive);
	const isLoading = useStateSelector((state) => state.crm_organization_card_info.isLoading);
	const actions = useActions();
	const [fromArchiveFetch] = CrmOrganizationService.fromArchiveById();
	const [crateHistoryFetch] = CrmHistoryService.create();
	const { userId } = useUserDeprecated();
	const [comment, setComment] = useState<string>('');
	const [error, setError] = useState<string>('');
	const [getCurrentFetch] = useCrmOrganizationGetCurrent();

	const handleModalClose = useCallback(() => {
		actions.setModal(['fromArchive', false]);
	}, [actions]);

	const handleFromArchive = async () => {
		if (!current?.id || !userId) {
			return;
		}

		if (comment.length < 10) {
			setError('Напишите более развернутый комментарий');
			return;
		}

		actions.setLoading(true);
		const response = await fromArchiveFetch({ id: current.id });
		if ('error' in response) {
			showNotification({
				color: 'red',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				message: response.error.data.message ?? 'Неизвестная ошибка, обратитесь в IT отдел',
			});
			return;
		}

		let message = `Организация ${current.nameEn} (${current.nameRu}) восстановлена из архива`;
		message += comment ? ` с комментарием: "${comment}"` : '';
		message += '.';
		await crateHistoryFetch({
			isSystem: true,
			type: 'log',
			userId: userId,
			organizationId: current.id,
			payload: message,
		});
		await getCurrentFetch({ id: current.id });

		showNotification({
			color: 'green',
			message: 'Организация восстановлена из архива',
		});
		actions.setLoading(false);
		handleModalClose();
	};

	return (
		<Modal
			title={'Восстановить из архива?'}
			opened={isShowModal}
			onClose={handleModalClose}
			loading={isLoading}
			size={520}
		>
			<TextField className={css.description}>
				Важно! Организация когда-то была помещена в архив и теперь Вы пытаетесь ее восстановить. Для этого
				необходимо указать причину восстановления.
			</TextField>

			<Textarea
				label={'Причина восстановления из архива'}
				value={comment}
				onChange={(event) => {
					setComment(event.currentTarget.value);
					setError('');
				}}
				error={error}
				required
			/>

			<Modal.Buttons>
				<Button onClick={handleModalClose}> Отмена </Button>

				<Button
					color={'success'}
					variant={'hard'}
					type={'submit'}
					iconLeft={<Icon name={'upload'} />}
					onClick={handleFromArchive}
					disabled={!!error}
				>
					{' '}
					Восстановить{' '}
				</Button>
			</Modal.Buttons>
		</Modal>
	);
};
