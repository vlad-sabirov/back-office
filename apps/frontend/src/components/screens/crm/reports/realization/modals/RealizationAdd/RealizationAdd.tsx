import { FC, useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, DateMonthPicker, InputNumber, Modal } from '@fsd/shared/ui-kit';
import { DateMonthPickerPropsValue } from '@fsd/shared/ui-kit/date-month-picker/DateMonthPicker.props';
import { MainContext } from '@globalStore';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { FilterPeriodType, ReportRealizationContext } from '@screens/crm/reports/realization';
import { ReportRealizationService } from '@services';
import css from './styles.module.scss';

export const RealizationAdd: FC = observer(() => {
	const { realizationStore, realizationMonthStore, realizationQuarterStore, realizationYearStore } =
		useContext(ReportRealizationContext);
	const { modalStore } = useContext(MainContext);
	const [dateError, setDateError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const userId = useStateSelector((state) => state.app.auth.userId);
	const parentId = useStateSelector((state) => state.app.auth.parentId);

	const form = useForm({
		initialValues: {
			date: null as DateMonthPickerPropsValue | null,
			realization: null as number | null,
			customerCount: null as number | null,
			customerNew: null as number | null,
			customerShipment: null as number | null,
			shipmentCount: null as number | null,
		},
	});
	const isFilledData = form.values.date && form.values.date.year && form.values.date.month;

	const handleClose = () => {
		modalStore.modalOpen('crmReportRealizationAdd', false);
		form.reset();
		setIsLoading(false);
		setDateError(null);
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		const { date, realization, customerCount, customerShipment, shipmentCount } = form.values;
		const fnUserId = Number(parentId || userId || 0);

		if (!date) {
			setDateError('Укажите дату');
			setIsLoading(false);
			return;
		}

		const [reportResponse, reportError] = await ReportRealizationService.findOnce({
			where: {
				userId: fnUserId ?? 0,
				year: Number(date.year),
				month: Number(date.month),
			},
		});

		if (reportError) {
			showNotification({
				message: reportError.message,
				color: 'red',
			});
			setIsLoading(false);
			return;
		}

		if (!reportResponse?.id) {
			setIsLoading(false);
			return true;
		}

		const [findDuplicate] = await ReportRealizationService.findMany({
			where: {
				userId: fnUserId ?? 0,
				year: date.year,
				month: date.month,
				realization: { gt: 0 },
			},
		});
		if (findDuplicate?.length) {
			setDateError('В системе уже есть отчет за этот месяц');
			showNotification({
				message: 'В системе уже есть отчет за этот месяц',
				color: 'red',
			});
			setIsLoading(false);
			return;
		}

		if (!realization) {
			form.setFieldError('realization', 'Укажите реализацию');
			setIsLoading(false);
			return;
		}

		if (!customerCount) {
			form.setFieldError('customerCount', 'Укажите количество клиентов');
			setIsLoading(false);
			return;
		}

		if (!customerShipment) {
			form.setFieldError('customerShipment', 'Укажите количество клиентов с отгруженными заказами');
			setIsLoading(false);
			return;
		}

		if (!shipmentCount) {
			form.setFieldError('shipmentCount', 'Укажите количество отгруженных заказов');
			setIsLoading(false);
			return;
		}

		const [, updateRealizationError] = await ReportRealizationService.updateById({
			id: reportResponse.id,
			updateDto: {
				realization: realization || undefined,
				customerCount: customerCount || undefined,
				customerShipment: customerShipment || undefined,
				shipmentCount: shipmentCount || undefined,
			},
		});

		if (updateRealizationError) {
			showNotification({
				message: updateRealizationError.message,
				color: 'red',
			});
			setIsLoading(false);
			return;
		}

		showNotification({ message: 'Отчет добавлен.', color: 'green' });
		if (realizationStore.sortType === FilterPeriodType.Month) await realizationMonthStore.getRealizationList();
		if (realizationStore.sortType === FilterPeriodType.Quarter) await realizationQuarterStore.getRealizationList();
		if (realizationStore.sortType === FilterPeriodType.Year) await realizationYearStore.getRealizationList();
		await realizationStore.getMinRealizationDate();
		await realizationStore.getMinPlanDate();
		await realizationStore.getMaxRealizationDate();
		await realizationStore.getMaxPlanDate();
		handleClose();
		form.reset();
	};

	return (
		<>
			<Modal
				title="Добавление отчета"
				opened={modalStore.modals.crmReportRealizationAdd}
				onClose={handleClose}
				size={480}
				loading={isLoading}
			>
				<div className={css.wrapper}>
					<DateMonthPicker
						label="Отчетный период"
						value={form.values.date || undefined}
						onChange={async (value) => {
							if (!value) return;
							form.setFieldValue('date', value);
							setDateError(null);

							const [findDuplicate] = await ReportRealizationService.findMany({
								where: {
									userId: Number(userId ?? 0),
									year: value.year,
									month: value.month,
									realization: { gt: 0 },
								},
							});
							if (findDuplicate?.length) {
								setDateError('В системе уже есть отчет за этот месяц');
							}
						}}
						error={dateError}
						className={css.formDate}
						minDate={realizationStore.minPlanDate || new Date()}
						maxDate={realizationStore.maxPlanDate || new Date()}
					/>

					<InputNumber
						label="Реализация"
						hideControls
						className={css.formRealization}
						{...form.getInputProps('realization')}
						disabled={!isFilledData}
						required
					/>

					<InputNumber
						label="Организаций в базе"
						hideControls
						className={css.formCustomerCount}
						{...form.getInputProps('customerCount')}
						disabled={!isFilledData}
						required
					/>

					<InputNumber
						label="Новых организаций"
						hideControls
						className={css.formCustomerNew}
						{...form.getInputProps('customerNew')}
						disabled={!isFilledData}
						required
					/>

					<InputNumber
						label="Организаций отгружено"
						hideControls
						className={css.formCustomerShipment}
						{...form.getInputProps('customerShipment')}
						disabled={!isFilledData}
						required
					/>

					<InputNumber
						label="Всего отгрузок"
						hideControls
						className={css.formShipmentCount}
						{...form.getInputProps('shipmentCount')}
						disabled={!isFilledData}
						required
					/>
				</div>

				<Modal.Buttons>
					<Button onClick={handleClose}>Отмена</Button>

					<Button color="primary" variant="hard" onClick={handleSubmit}>
						Сохранить
					</Button>
				</Modal.Buttons>
			</Modal>
		</>
	);
});
