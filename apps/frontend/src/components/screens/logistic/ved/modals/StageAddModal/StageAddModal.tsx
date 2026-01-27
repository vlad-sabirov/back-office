import { FC, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Input, InputNumber, Modal, Select, Textarea } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { ILogisticVedStageCreateDto } from '@screens/logistic';
import { useGetData } from '@screens/staff/shared/hooks/useGetData';
import LogisticService from '@services/Logistic.service';
import css from './styles.module.scss';

interface IActionExpectedList {
	value: string;
	label: string;
}

const filterRoles = ['logisticVedOrdersVed', 'logisticVedOrdersCalculate', 'logisticVedOrdersAuthor'];

export const StageAddModal: FC = observer(() => {
	useGetData();
	const { modalStore, logisticStore, staffStore } = useContext(MainContext);
	const [actionExpected, setActionExpectedId] = useState<IActionExpectedList[]>([] as IActionExpectedList[]);
	const [warningType, setWarningType] = useState<string | null>('days');
	const [errorType, setErrorType] = useState<string | null>('days');
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (staffStore.userRoleList.length > 0) {
			const newList = staffStore.userRoleList.filter((role) => filterRoles.includes(role.alias));
			if (newList.length)
				setActionExpectedId(newList.map((role) => ({ value: String(role.id), label: role.description })));
		}
	}, [staffStore.userRoleList]);

	const form = useForm({
		initialValues: {
			name: '',
			description: '',
			alias: '',
			warningTime: 3,
			errorTime: 7,
			actionExpectedId: '',
		},
	});

	const onSubmit = async () => {
		setIsLoading(true);
		const { name, alias, actionExpectedId, description } = form.values;
		const warningTime = warningType === 'days' ? form.values.warningTime * 24 : form.values.warningTime;
		const errorTime = errorType === 'days' ? form.values.errorTime * 24 : form.values.errorTime;

		if (name.length === 0) {
			form.setFieldError('name', 'Укажите название стадии');
			setIsLoading(false);
			return false;
		}

		if (name.length < 4) {
			form.setFieldError('name', 'Минимум 4 символа');
			setIsLoading(false);
			return false;
		}

		if (name.length > 32) {
			form.setFieldError('name', 'Максимум 64 символа');
			setIsLoading(false);
			return false;
		}

		if (alias.length < 4) {
			form.setFieldError('alias', 'Минимум 4 символа');
			setIsLoading(false);
			return false;
		}

		if (alias.length > 32) {
			form.setFieldError('alias', 'Максимум 64 символа');
			setIsLoading(false);
			return false;
		}

		if (actionExpectedId.length === 0) {
			form.setFieldError('actionExpectedId', 'Укажите ответственного');
			setIsLoading(false);
			return false;
		}

		if (description.length === 0) {
			form.setFieldError('description', 'Укажите описание');
			setIsLoading(false);
			return false;
		}

		if (description.length < 12) {
			form.setFieldError('description', 'Минимум 12 символов');
			setIsLoading(false);
			return false;
		}

		if (warningTime <= 0) {
			form.setFieldError('warningTime', 'Неверный формат желтой зоны');
			setIsLoading(false);
			return false;
		}

		if (errorTime <= warningTime) {
			form.setFieldError('errorTime', 'Неверный формат красной зоны');
			setIsLoading(false);
			return false;
		}

		const findDuplicateName = await LogisticService.findStageByName(form.values.name);
		if (findDuplicateName.data?.id) {
			form.setFieldError('name', 'Уже есть стадия с таким названием');
			setIsLoading(false);
			return false;
		}

		const findDuplicateAlias = await LogisticService.findStageByAlias(form.values.alias);
		if (findDuplicateAlias.data?.id) {
			form.setFieldError('alias', 'Уже есть стадия с таким индексом');
			setIsLoading(false);
			return false;
		}

		const dto: ILogisticVedStageCreateDto = {
			name,
			alias,
			description,
			warningTime,
			errorTime,
			actionExpectedId: Number(actionExpectedId),
		};

		const [, error] = await LogisticService.createStage(dto);

		if (error) {
			showNotification({
				color: 'red',
				message: error.message,
			});
			setIsLoading(false);
			return;
		}

		await logisticStore.getLogisticVedStageListWithOrderOptions({
			userId: logisticStore.displayOrdersAuthor,
			isClose: logisticStore.displayOrdersClosed,
			isDone: logisticStore.displayOrdersDone,
		});

		modalStore.modalOpen('logisticStagesVedAdd', false);

		showNotification({
			color: 'green',
			message: `Вы успешно добавили стадию ${dto.name}.`,
		});

		form.reset();
		setIsLoading(false);
	};

	return (
		<Modal
			title="Добавление стадии"
			opened={modalStore.modals.logisticStagesVedAdd}
			onClose={() => {
				modalStore.modalOpen('logisticStagesVedAdd', false);
				form.reset();
			}}
			size={700}
			loading={isLoading}
		>
			<form onSubmit={form.onSubmit(onSubmit)} className={css.wrapper}>
				<Input
					mode="text"
					variant="white"
					size="medium"
					label="Название стадии"
					{...form.getInputProps('name')}
					className={css.name}
					required
				/>

				<Input
					mode="text"
					variant="white"
					size="medium"
					label="Индекс"
					{...form.getInputProps('alias')}
					className={css.alias}
					required
				/>

				<Select
					label="Ответственный"
					data={actionExpected}
					{...form.getInputProps('actionExpectedId')}
					className={css.actionExpected}
					required
				/>

				<Textarea
					variant="white"
					size="medium"
					label="Описание"
					required
					{...form.getInputProps('description')}
					className={css.description}
				/>

				<div className={css.warningTime}>
					<InputNumber
						min={1}
						variant="white"
						size="medium"
						label="Желтая зона"
						required
						{...form.getInputProps('warningTime')}
					/>

					<Select
						label={' '}
						data={[
							{ value: 'hours', label: 'часы' },
							{ value: 'days', label: 'дни' },
						]}
						value={warningType}
						onChange={setWarningType}
					/>
				</div>

				<div className={css.errorTime}>
					<InputNumber
						variant="white"
						size="medium"
						label="Красная зона"
						required
						{...form.getInputProps('errorTime')}
					/>

					<Select
						label={' '}
						data={[
							{ value: 'hours', label: 'часы' },
							{ value: 'days', label: 'дни' },
						]}
						value={errorType}
						onChange={setErrorType}
					/>
				</div>
			</form>

			<Modal.Buttons>
				<Button
					onClick={() => {
						modalStore.modalOpen('logisticStagesVedAdd', false);
						form.reset();
					}}
				>
					Отмена
				</Button>
				<Button color="primary" variant="hard" onClick={onSubmit}>
					Добавить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
});
