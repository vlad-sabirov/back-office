import { FC, useCallback, useState } from 'react';
import { CrmHistoryService } from '@fsd/entities/crm-history';
import { CrmOrganizationService, useCrmOrganizationGetCurrent } from '@fsd/entities/crm-organization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Modal, TextField, Textarea } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { showNotification } from '@mantine/notifications';
import { useActions } from '../../lib/use-actions';
import css from './modal-to-archive.module.scss';

export const ModalToArchive: FC = () => {
	const current = useStateSelector((state) => state.crm_organization.data.current);
	const isShowModal = useStateSelector((state) => state.crm_organization_card_info.modals.toArchive);
	const isLoading = useStateSelector((state) => state.crm_organization_card_info.isLoading);
	const actions = useActions();
	const [toArchiveFetch] = CrmOrganizationService.toArchiveById();
	const [crateHistoryFetch] = CrmHistoryService.create();
	const { userId } = useUserDeprecated();
	const [comment, setComment] = useState<string>('');
	const [error, setError] = useState<string>('');
	const [getCurrentFetch] = useCrmOrganizationGetCurrent();

	const handleModalClose = useCallback(() => {
		actions.setModal(['toArchive', false]);
	}, [actions]);

	const handleToArchive = async () => {
		if (!current?.id || !userId) {
			return;
		}

		if (comment.length < 10) {
			setError('Напишите более развернутый комментарий');
			return;
		}

		actions.setLoading(true);
		const response = await toArchiveFetch({ id: current.id });
		if ('error' in response) {
			showNotification({
				color: 'red',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				message: response.error.data.message ?? 'Неизвестная ошибка, обратитесь в IT отдел',
			});
			return;
		}

		let message = `Организация ${current.nameEn} (${current.nameRu}) перенесена в архив`;
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
			message: 'Организация перенесена в архив',
		});
		actions.setLoading(false);
		handleModalClose();
	};

	return (
		<Modal
			title={'Перенести в архив?'}
			opened={isShowModal}
			onClose={handleModalClose}
			loading={isLoading}
			size={520}
		>
			<TextField className={css.description}>
				Важно! Перенесенная в архив организация будет скрыта из общего списка организаций, а также она будет
				отвязана от всех имеющихся контактов.
			</TextField>

			<TextField className={css.descriptionRed} size={'large'}>
				Вы уверены что хотите перенести организацию в архив? Действие необратимо!
			</TextField>

			<TextField className={css.description}>Если да, то заполните причину переноса.</TextField>

			<Textarea
				label={'Причина переноса в архив'}
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
					color={'error'}
					variant={'hard'}
					type={'submit'}
					iconLeft={<Icon name={'trash'} />}
					onClick={handleToArchive}
					disabled={!!error}
				>
					{' '}
					В архив{' '}
				</Button>
			</Modal.Buttons>
		</Modal>
	);
};
