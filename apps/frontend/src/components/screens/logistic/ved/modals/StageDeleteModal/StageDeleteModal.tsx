import { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { showNotification } from '@mantine/notifications';
import LogisticService from '@services/Logistic.service';

export const StageDeleteModal = observer((): JSX.Element => {
	const { modalStore, logisticStore } = useContext(MainContext);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	if (logisticStore.logisticVedStageCurrent) {
		const { id, name } = logisticStore.logisticVedStageCurrent;

		const onClick = async () => {
			setIsLoading(true);

			if (logisticStore.logisticVedStageList?.length === 1) {
				await logisticStore.getLogisticVedStageListWithOrderOptions({
					userId: logisticStore.displayOrdersAuthor,
					isClose: logisticStore.displayOrdersClosed,
					isDone: logisticStore.displayOrdersDone,
				});

				showNotification({
					color: 'red',
					message:
						`Невозможно удалить стадию ${name}, так как она является в системе единственной. ` +
						`Прежде чем удалить эту стадию, для начала создайте новую.`,
				});

				modalStore.modalOpen('logisticStagesVedDelete', false);
				setIsLoading(false);
				return;
			}

			const { data: response } = await LogisticService.deleteStageById(id);

			if (response?.statusCode) {
				await logisticStore.getLogisticVedStageListWithOrderOptions({
					userId: logisticStore.displayOrdersAuthor,
					isClose: logisticStore.displayOrdersClosed,
					isDone: logisticStore.displayOrdersDone,
				});

				showNotification({
					color: 'red',
					message: `Невозможно удалить стадию ${name}, так как она уже была ранее удалена.`,
				});

				modalStore.modalOpen('logisticStagesVedDelete', false);
				setIsLoading(false);
				return;
			}

			await logisticStore.getLogisticVedStageListWithOrderOptions({
				userId: logisticStore.displayOrdersAuthor,
				isClose: logisticStore.displayOrdersClosed,
				isDone: logisticStore.displayOrdersDone,
			});
			showNotification({
				color: 'green',
				message: `Вы успешно удалили стадию ${name}.`,
			});
			modalStore.modalOpen('logisticStagesVedDelete', false);
			setIsLoading(false);
		};

		return (
			<Modal
				opened={modalStore.modals.logisticStagesVedDelete}
				onClose={() => modalStore.modalOpen('logisticStagesVedDelete', false)}
				title="Удалить стадию?"
				size={450}
				loading={isLoading}
			>
				<Head>
					<title>Удаление стадии {name}. Back Office</title>
				</Head>

				<TextField>
					Вы пытаетесь удалить стадию <b>{name}</b>.
				</TextField>
				<TextField>
					После ее удаления, Вы не сможете восстановить данные. Точно удалить выбранную стадию{' '}
					{logisticStore.logisticVedStageCurrent?.name}?
				</TextField>

				<Modal.Buttons>
					<Button onClick={() => modalStore.modalOpen('logisticStagesVedDelete')}>Отмена</Button>

					<Button color="error" variant="hard" onClick={onClick}>
						<Icon name="trash" />
						&nbsp;Точно удалить
					</Button>
				</Modal.Buttons>
			</Modal>
		);
	}

	return <></>;
});
