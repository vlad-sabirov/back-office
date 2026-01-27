import { FC, useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Button, DateMonthPicker, InputNumber, Modal } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { ReportRealizationService } from '@services';
import { DateMonthPickerPropsValue } from '@fsd/shared/ui-kit/date-month-picker/DateMonthPicker.props';
import { FilterPeriodType, RealizationEditProps, ReportRealizationContext } from '../..';
import css from './styles.module.scss';

export const RealizationEdit: FC<RealizationEditProps> = observer(({ data }) => {
	const { modalStore } = useContext(MainContext);
	const { realizationStore, realizationMonthStore, realizationQuarterStore, realizationYearStore } =
		useContext(ReportRealizationContext);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [dateError, setDateError] = useState<string | null>(null);

	const form = useForm({
		initialValues: {
			userId: null as string | null,
			date: null as DateMonthPickerPropsValue | null,
			plan: null as number | null,
			realization: null as number | null,
			customerCount: null as number | null,
			customerNew: null as number | null,
			customerShipment: null as number | null,
			shipmentCount: null as number | null,
		},
	});

	useEffect(() => {
		let isMounted = true;

		(async () => {
			if (isMounted) setIsLoading(true);
			if (modalStore.modals.crmReportRealizationEdit) {
				if (isMounted && data) {
					form.setFieldValue('realization', data.realization as number);
					form.setFieldValue('plan', data.plan as number);
					form.setFieldValue('userId', String(data.userId));
					form.setFieldValue('date', {
						year: String(data.year),
						month: String(data.month),
					});
					form.setFieldValue('customerCount', data.customerCount as number);
					form.setFieldValue('customerShipment', data.customerShipment as number);
					form.setFieldValue('shipmentCount', data.shipmentCount as number);
				}
			}
			if (isMounted) setIsLoading(false);
		})();

		return () => {
			isMounted = false;
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalStore.modals.crmReportRealizationEdit]);

	const handleClose = () => {
		setIsLoading(false);
		modalStore.modalOpen('crmReportRealizationEdit', false);
	};

	const handleSubmit = async () => {
		if (!data) return;
		setIsLoading(true);
		const { date, realization, customerCount, customerNew, customerShipment, shipmentCount } = form.values;

		if (!date) {
			setDateError('Укажите дату');
			setIsLoading(false);
			return;
		}

		const [duplicateResponse] = await ReportRealizationService.findOnce({
			where: { userId: Number(data.userId), year: date.year, month: date.month },
		});
		if (duplicateResponse && data && duplicateResponse.id !== data.id) {
			showNotification({
				message: 'Такой отчет уже существует',
				color: 'red',
			});

			setDateError('На этот месяц уже есть отчет');
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

		if (!customerNew) {
			form.setFieldError('customerNew', 'Укажите количество новых клиентов');
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

		const [, realizationError] = await ReportRealizationService.updateById({
			id: data.id,
			updateDto: {
				year: Number(date.year),
				month: Number(date.month),
				realization: Number(realization),
				customerCount: Number(customerCount),
				customerShipment: Number(customerShipment),
				shipmentCount: Number(shipmentCount),
			},
		});

		if (realizationError) {
			showNotification({
				message: realizationError.message,
				color: 'red',
			});
			setIsLoading(false);
			return;
		}

		showNotification({
			message: 'Изменения сохранены',
			color: 'green',
		});

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
				title="Изменение отчета"
				opened={modalStore.modals.crmReportRealizationEdit}
				onClose={handleClose}
				size={480}
				loading={isLoading}
			>
				<div className={css.wrapper}>
					<DateMonthPicker
						label="Отчетный период"
						value={form.values.date || undefined}
						onChange={(value) => {
							form.setFieldValue('date', value);
							setDateError(null);
						}}
						error={dateError}
						className={css.formDate}
						minDate={new Date('2018')}
						maxDate={new Date()}
					/>

					<InputNumber
						label="Реализация"
						hideControls
						className={css.formRealization}
						{...form.getInputProps('realization')}
						required
					/>
					<InputNumber
						label="Организаций в базе"
						hideControls
						className={css.formCustomerCount}
						{...form.getInputProps('customerCount')}
						required
					/>
					<InputNumber
						label="Новых организаций"
						hideControls
						className={css.formCustomerNew}
						{...form.getInputProps('customerNew')}
						required
					/>
					<InputNumber
						label="Организаций отгружено"
						hideControls
						className={css.formCustomerShipment}
						{...form.getInputProps('customerShipment')}
						required
					/>
					<InputNumber
						label="Всего отгрузок"
						hideControls
						className={css.formShipmentCount}
						{...form.getInputProps('shipmentCount')}
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
