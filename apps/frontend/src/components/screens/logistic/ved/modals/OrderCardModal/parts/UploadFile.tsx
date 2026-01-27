import { useContext, useState } from 'react';
import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Button, Dropzone, Icon, Modal, TextField, Textarea } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { MIME_TYPES } from '@mantine/dropzone';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { ILogisticVedFileCreateDto, ILogisticVedOrderUpdateDto } from '@screens/logistic';
import LogisticService from '@services/Logistic.service';
import UserService from '@services/User.service';
import css from './UploadFile.module.scss';
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const LogisticOrderVedCardUploadFile = observer((): JSX.Element => {
	const { logisticStore } = useContext(MainContext);
	const [fileError, setFileError] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const userId = useStateSelector((state) => state.app.auth.userId);

	const form = useForm({
		initialValues: {
			comment: '',
			file: {} as File,
		},
	});

	const onSubmit = async () => {
		setIsLoading(true);
		const { file, comment } = form.values;

		if (!file.size) {
			setFileError('Выберите файл');
			setIsLoading(false);
			return;
		}

		if (!file.type.includes('sheet')) {
			setFileError('Неверный формат файла');
			setIsLoading(false);
			return;
		}

		if (logisticStore.logisticVedOrderCurrent) {
			const fileDto: ILogisticVedFileCreateDto = {
				file,
				type: logisticStore.fileType,
				comment: comment,
				orderId: logisticStore.logisticVedOrderCurrent.id,
				authorId: Number(userId ?? 0),
			};

			const { data: orderFile } = await LogisticService.createFile(fileDto);
			if (orderFile.statusCode) {
				showNotification({ color: 'red', message: orderFile.message });
				setIsLoading(false);
				return;
			}
			const { data: orderUpdateResponse } = await LogisticService.updateOrderById(
				logisticStore.logisticVedOrderCurrent.id,
				{
					fileOrder: logisticStore.fileType === 'order' ? orderFile.url : undefined,
					fileCalculate: logisticStore.fileType === 'calculating' ? orderFile.url : undefined,
				} as ILogisticVedOrderUpdateDto
			);
			if (orderUpdateResponse.statusCode) {
				showNotification({ color: 'red', message: orderFile.message });
				setIsLoading(false);
				return;
			}

			const [author] = await UserService.findById(userId ?? 0);
			if (!author) return;
			await LogisticService.createHistory({
				title: 'Загружен новый файл',
				description: `${author.lastName} ${author.firstName} ${
					author.sex === 'male' ? 'загрузил' : 'загрузила'
				} новый файл ${logisticStore.fileType === 'order' ? 'заявки' : 'расчетов'}.`,
				authorId: author.id,
				orderId: logisticStore.logisticVedOrderCurrent.id,
			});

			logisticStore.setModalOrderStage('uploadFile', false);

			await logisticStore.getLogisticVedStageListWithOrderOptions({
				userId: logisticStore.displayOrdersAuthor,
				isClose: logisticStore.displayOrdersClosed,
				isDone: logisticStore.displayOrdersDone,
			});

			await logisticStore.getLogisticVedOrderByID(logisticStore.logisticVedOrderCurrent.id);

			showNotification({
				color: 'green',
				message: 'Вы только что успешно загрузили файл',
			});

			form.reset();

			setIsLoading(false);
		}
	};

	return (
		<Modal
			title={logisticStore.fileType === 'order' ? 'Загрузить файл заявки' : 'Загрузить файл расчетов'}
			opened={logisticStore.modalOrderStage.uploadFile}
			onClose={() => logisticStore.setModalOrderStage('uploadFile', false)}
			size={440}
			loading={isLoading}
		>
			<div className={css.wrapper}>
				<a
					href={`${
						logisticStore.fileType === 'calculating' &&
						!logisticStore.logisticVedOrderCurrent?.fileCalculate
							? '/files/logistic/calculate_ved_template.xlsx'
							: '/api/static' + logisticStore.fileType === 'order'
							? logisticStore.logisticVedOrderCurrent?.fileOrder
							: logisticStore.logisticVedOrderCurrent?.fileCalculate
					}`}
					download={`Заявка ВЭД ${format(new Date(), 'yyyy-MM-dd')}${
						logisticStore.fileType === 'calculating' ? ' (расчет)' : ''
					}`}
					className={css.oldVersion}
				>
					<Icon name="excel" />
					<TextField size="small">
						{logisticStore.fileType === 'calculating' &&
						!logisticStore.logisticVedOrderCurrent?.fileCalculate
							? 'Шаблон расчетов'
							: 'Актуальная версия'}
					</TextField>
				</a>

				<Dropzone
					label="Файл заявки"
					accept={[MIME_TYPES.xls, MIME_TYPES.xlsx]}
					defaultStatus={<TextField size="small">Загрузите файл</TextField>}
					acceptStatus={<TextField size="small">Загрузить</TextField>}
					rejectStatus={<TextField size="small">Файл не поддерживается</TextField>}
					onDrop={(files) => {
						form.values.file = files[0];
						setFileError('');
					}}
					required
					className={css.file}
					error={fileError}
				/>

				<Textarea
					variant="white"
					size="medium"
					label="Причина загрузки"
					{...form.getInputProps('comment')}
					className={css.comment}
				/>
			</div>

			<Modal.Buttons>
				<Button onClick={() => logisticStore.setModalOrderStage('uploadFile')}>Отмена</Button>
				<Button color="primary" variant="hard" onClick={onSubmit}>
					Загрузить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
});
