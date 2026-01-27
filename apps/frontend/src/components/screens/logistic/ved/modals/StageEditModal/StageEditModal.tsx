import { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, Input, InputNumber, Modal, Select, Textarea } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { ILogisticVedStageUpdateDto } from '@screens/logistic';
import LogisticService from '@services/Logistic.service';
import css from './styles.module.scss';

interface IActionExpectedList {
	value: string;
	label: string;
}

const filterRoles = ['logisticVedOrdersVed', 'logisticVedOrdersCalculate', 'logisticVedOrdersAuthor'];

export const StageEditModal = observer((): JSX.Element => {
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
			actionExpectedId: '',
			warningTime: 3,
			errorTime: 7,
		},
	});

	useEffect(() => {
		if (!logisticStore.logisticVedStageCurrent) return;

		form.setFieldValue('name', logisticStore.logisticVedStageCurrent.name);
		form.setFieldValue('description', logisticStore.logisticVedStageCurrent.description);
		form.setFieldValue('alias', logisticStore.logisticVedStageCurrent.alias);
		form.setFieldValue('actionExpectedId', String(logisticStore.logisticVedStageCurrent.actionExpectedId));

		if (
			logisticStore.logisticVedStageCurrent.warningTime > 24 &&
			logisticStore.logisticVedStageCurrent.warningTime % 24 === 0
		) {
			setWarningType('days');
			form.setFieldValue('warningTime', logisticStore.logisticVedStageCurrent.warningTime / 24);
		} else {
			setWarningType('hours');
			form.setFieldValue('warningTime', logisticStore.logisticVedStageCurrent.warningTime);
		}

		if (
			logisticStore.logisticVedStageCurrent.errorTime > 24 &&
			logisticStore.logisticVedStageCurrent.errorTime % 24 === 0
		) {
			setErrorType('days');
			form.setFieldValue('errorTime', logisticStore.logisticVedStageCurrent.errorTime / 24);
		} else {
			setErrorType('hours');
			form.setFieldValue('errorTime', logisticStore.logisticVedStageCurrent.errorTime);
		}
		// form.setFieldValue('errorTime', logisticStore.logisticVedStageCurrent.errorTime);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [logisticStore.logisticVedStageCurrent, modalStore.modals.logisticStagesVedEdit]);

	if (logisticStore.logisticVedStageCurrent) {
		const { id } = logisticStore.logisticVedStageCurrent;
		const { name, alias, actionExpectedId, description } = form.values;
		const warningTime = warningType === 'days' ? form.values.warningTime * 24 : form.values.warningTime;
		const errorTime = errorType === 'days' ? form.values.errorTime * 24 : form.values.errorTime;

		const onSubmit = async () => {
			setIsLoading(true);

			if (name.length === 0) {
				form.setFieldError('name', 'Укажите название стадии');
				setIsLoading(false);
				return;
			}

			if (name.length < 4) {
				form.setFieldError('name', 'Минимум 4 символа');
				setIsLoading(false);
				return;
			}

			if (name.length > 32) {
				form.setFieldError('name', 'Максимум 64 символа');
				setIsLoading(false);
				return;
			}

			if (alias.length < 4) {
				form.setFieldError('alias', 'Минимум 4 символа');
				setIsLoading(false);
				return;
			}

			if (alias.length > 32) {
				form.setFieldError('alias', 'Максимум 64 символа');
				setIsLoading(false);
				return;
			}

			if (actionExpectedId.length === 0) {
				form.setFieldError('actionExpectedId', 'Укажите ответственного');
				setIsLoading(false);
				return;
			}

			if (description.length === 0) {
				form.setFieldError('description', 'Укажите описание');
				setIsLoading(false);
				return;
			}

			if (description.length < 12) {
				form.setFieldError('description', 'Минимум 12 символов');
				setIsLoading(false);
				return;
			}

			if (warningTime <= 0) {
				form.setFieldError('warningTime', 'Неверный формат желтой зоны');
				setIsLoading(false);
				return;
			}

			if (errorTime <= warningTime) {
				form.setFieldError('errorTime', 'Неверный формат красной зоны');
				setIsLoading(false);
				return;
			}

			const findDuplicateName = await LogisticService.findStageByName(form.values.name);
			if (findDuplicateName.data && findDuplicateName.data.id && findDuplicateName.data.id != id) {
				form.setFieldError('name', 'Уже есть стадия с таким названием');
				setIsLoading(false);
				return;
			}

			const findDuplicateAlias = await LogisticService.findStageByAlias(form.values.alias);
			if (findDuplicateAlias.data && findDuplicateAlias.data.id && findDuplicateAlias.data.id != id) {
				form.setFieldError('alias', 'Уже есть стадия с таким индексом');
				setIsLoading(false);
				return;
			}

			const dto: ILogisticVedStageUpdateDto = {
				name,
				alias,
				description,
				warningTime,
				errorTime,
				actionExpectedId: Number(actionExpectedId),
			};

			const { data: response } = await LogisticService.updateStageById(id, dto);
			if (response?.id) {
				await logisticStore.getLogisticVedStageListWithOrderOptions({
					userId: logisticStore.displayOrdersAuthor,
					isClose: logisticStore.displayOrdersClosed,
					isDone: logisticStore.displayOrdersDone,
				});

				modalStore.modalOpen('logisticStagesVedEdit', false);

				showNotification({
					color: 'green',
					message: `Вы успешно изменили стадию ${dto.name}.`,
				});

				setIsLoading(false);
				setTimeout(form.reset, 700);
			}
		};

		return (
			<Modal
				title="Изменение стадии"
				opened={modalStore.modals.logisticStagesVedEdit}
				onClose={() => {
					modalStore.modalOpen('logisticStagesVedEdit', false);
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
						required
						{...form.getInputProps('name')}
						className={css.name}
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
							modalStore.modalOpen('logisticStagesVedEdit', false);
							form.reset();
						}}
					>
						Отмена
					</Button>
					<Button color="primary" variant="hard" onClick={onSubmit}>
						Изменить
					</Button>
				</Modal.Buttons>
			</Modal>
		);
	}

	return <></>;
});
