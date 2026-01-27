import { useContext, useState } from 'react';
import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Button, Dropzone, Icon, Input, Modal, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { MIME_TYPES } from '@mantine/dropzone';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import LogisticService from '@services/Logistic.service';
import NotificationService from '@services/Notification.service';
import UserService from '@services/User.service';
import { ILogisticVedFileCreateDto, ILogisticVedOrderCreateDto } from '../..';
import { ILogisticVedOrderUpdateDto, LogisticVedOrderConstants } from '../..';
import css from './styles.module.scss';
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const OrderAddModal = observer((): JSX.Element => {
	const { modalStore, logisticStore } = useContext(MainContext);
	const [fileError, setFileError] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const userId = useStateSelector((state) => state.app.auth.userId);

	const form = useForm({
		initialValues: {
			name: '',
			comment: '',
			file: {} as File,
		},
	});

	const onSubmit = async () => {
		const { name, comment, file } = form.values;
		setIsLoading(true);

		if (name.length < 4) {
			form.setFieldError('name', LogisticVedOrderConstants.form.VALIDATION_NAME_LENGTH);
			setIsLoading(false);
			return;
		}

		if (!form.values.file.size) {
			setFileError(LogisticVedOrderConstants.form.VALIDATION_FILE_NOT_FOUND);
			setIsLoading(false);
			return;
		}

		if (!form.values.file.type.includes('sheet')) {
			setFileError(LogisticVedOrderConstants.form.VALIDATION_FILE_TYPE);
			setIsLoading(false);
			return;
		}

		const orderCreateDto: ILogisticVedOrderCreateDto = { name, authorId: Number(userId ?? 0) };
		const { data: orderCreateResponse } = await LogisticService.createOrder(orderCreateDto);
		if (orderCreateResponse.statusCode) {
			showNotification({
				color: 'red',
				message: orderCreateResponse.message,
			});
			setIsLoading(false);
			return;
		}

		const fileDto: ILogisticVedFileCreateDto = {
			file,
			type: 'order',
			orderId: orderCreateResponse.id,
			authorId: Number(userId ?? 0),
		};
		const { data: orderFile } = await LogisticService.createFile(fileDto);
		if (orderFile.statusCode) {
			showNotification({ color: 'red', message: orderFile.message });
			setIsLoading(false);
			return;
		}
		const { data: orderUpdateResponse } = await LogisticService.updateOrderById(orderCreateResponse.id, {
			fileOrder: orderFile.url,
		} as ILogisticVedOrderUpdateDto);
		if (orderUpdateResponse.statusCode) {
			showNotification({ color: 'red', message: orderFile.message });
			setIsLoading(false);
			return;
		}

		if (comment.length > 0) {
			const { data: commentResponse } = await LogisticService.createComment({
				comment,
				authorId: Number(userId ?? 0),
				orderId: orderCreateResponse.id,
			});
			if (commentResponse.statusCode) {
				showNotification({ color: 'red', message: orderFile.message });
				setIsLoading(false);
				return;
			}
		}

		const [author] = await UserService.findById(Number(userId ?? 0));
		if (!author) return;
		await LogisticService.createHistory({
			title: 'Добавлена заявка',
			description: `${author.lastName} ${author.firstName} ${
				author.sex === 'male' ? 'создал' : 'создала'
			} создал заявку.`,
			authorId: author.id,
			orderId: orderCreateResponse.id,
		});

		await logisticStore.getLogisticVedStageListWithOrderOptions({
			userId: logisticStore.displayOrdersAuthor,
			isClose: logisticStore.displayOrdersClosed,
			isDone: logisticStore.displayOrdersDone,
		});

		showNotification({
			color: 'green',
			message: LogisticVedOrderConstants.form.SUCCESS_ADD.DESCRIPTION,
		});

		const [performers] = await UserService.findByRole('logisticVedOrdersVed');
		if (performers) {
			performers.map(async (user) => {
				await NotificationService.sendMessageTelegram({
					chatId: Number(user.telegramId),
					message:
						`<b>Заявки ВЭД.</b>\n` +
						`Добавлена новая заявка в ВЭД. От Вас требуется ознакомиться с заявкой. ` +
						`Если заявка оформлена правильно, то необходимо выбрать ответственного за проработку заявки.` +
						// eslint-disable-next-line max-len
						`\n\n<a href='${location.hostname}/logistic/ved/${orderCreateResponse.id}'>Ознакомиться с заявкой</a>`,
				});
			});
		}

		form.reset();
		setIsLoading(false);
		modalStore.modalOpen('logisticVedOrderAdd', false);
	};

	return (
		<Modal
			title="Добавление заявки ВЭД"
			opened={modalStore.modals.logisticVedOrderAdd}
			onClose={() => modalStore.modalOpen('logisticVedOrderAdd', false)}
			size={440}
			loading={isLoading}
		>
			<form onSubmit={form.onSubmit(onSubmit)} className={css.wrapper}>
				<Input
					mode="text"
					variant="white"
					size="medium"
					label="Название заявки"
					{...form.getInputProps('name')}
					className={css.name}
					required
				/>

				<a
					href="/files/logistic/order_ved_template.xlsx"
					download={`Заявка ВЭД ${format(new Date(), 'yyyy-MM-dd')}`}
					className={css.template}
				>
					<Icon name="excel" />
					<TextField size="small">Скачать шаблон</TextField>
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

				<Input
					mode="text"
					variant="white"
					size="medium"
					label="Комментарий"
					{...form.getInputProps('comment')}
					className={css.comment}
				/>
			</form>

			<Modal.Buttons>
				<Button onClick={() => modalStore.modalOpen('logisticVedOrderAdd')}>Отмена</Button>
				<Button color="primary" variant="hard" onClick={onSubmit}>
					Добавить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
});
