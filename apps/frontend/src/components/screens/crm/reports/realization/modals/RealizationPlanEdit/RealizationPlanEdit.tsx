/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FC, useContext, useEffect, useState } from 'react';
import { IForm } from './interfaces';
import { format, parse } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { Button, InputNumber, Modal } from '@fsd/shared/ui-kit';
import { customLocaleRu } from '@config/date-fns.locale';
import { MainContext } from '@globalStore';
import { ReportRealizationResponse } from '@interfaces';
import { showNotification } from '@mantine/notifications';
import { FilterPeriodType, ReportRealizationContext } from '@screens/crm/reports/realization';
import { ReportRealizationService } from '@services';
import UserService from '@services/User.service';
import { RealizationPlanEditProps } from './props';
import css from './styles.module.scss';
import { StaffAvatar } from '@fsd/entities/staff';

export const RealizationPlanEdit: FC<RealizationPlanEditProps> = observer(({ data }) => {
	const { modalStore } = useContext(MainContext);
	const { realizationStore, realizationMonthStore, realizationQuarterStore, realizationYearStore } =
		useContext(ReportRealizationContext);
	const [users, setUsers] = useState<ReportRealizationResponse[] | null>(data);
	const [form, setForm] = useState<IForm[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const handleCloseModal = () => {
		setIsLoading(false);
		modalStore.modalOpen('crmReportRealizationPlanEdit', false);
	};

	const handleSubmit = async () => {
		if (!data || !data.length) return;
		setIsLoading(true);

		try {
			for (const dataItem of data) {
				if (!dataItem.id) continue;
				const [, error] = await ReportRealizationService.updateById({
					id: dataItem.id,
					updateDto: {
						plan: form.find((item) => item.id === dataItem.id)?.plan,
					},
				});

				if (error) {
					// noinspection ExceptionCaughtLocallyJS
					throw Error(error.message);
				}
			}
		} catch (err) {
			showNotification({
				message: err as string,
				color: 'red',
			});
			setIsLoading(false);
			return;
		}

		showNotification({
			message: (
				<>
					Вы только что изменили планы за{' '}
					{format(parse(`${data[0].year}-${data[0].month}`, 'yyyy-MM', new Date()), 'LLLL yyyy', {
						locale: customLocaleRu,
					})}
				</>
			),
			color: 'green',
		});

		if (realizationStore.sortType === FilterPeriodType.Month) await realizationMonthStore.getRealizationList();
		if (realizationStore.sortType === FilterPeriodType.Quarter) await realizationQuarterStore.getRealizationList();
		if (realizationStore.sortType === FilterPeriodType.Year) await realizationYearStore.getRealizationList();
		await realizationStore.getMinRealizationDate();
		await realizationStore.getMinPlanDate();
		await realizationStore.getMaxRealizationDate();
		await realizationStore.getMaxPlanDate();
		await realizationStore.getPlanList();
		handleCloseModal();
	};

	useEffect(() => {
		if (!data?.[0]) return;
		let isMounted = true;
		setUsers(data);

		(async () => {
			setIsLoading(true);
			const [usersResponse] = await UserService.findSeniorSales();
			if (isMounted && usersResponse) {
				const result = usersResponse
					.filter((user) => !data.some((dataUser) => dataUser.user?.id === user.id))
					.map((user) => ({
						id: 0,
						year: data ? data[0].year : 0,
						month: data ? data[0].month : 0,
						plan: 0,
						realization: 0,
						customerCount: 0,
						customerShipment: 0,
						shipmentCount: 0,
						userId: 0,
						user: user,
						createdAt: new Date(),
						updatedAt: new Date(),
					}));
				data.push(...result);
				if (isMounted) setUsers(data);
			}

			const formData: IForm[] = [];
			data.forEach((plan) => {
				formData.push({ id: plan.id, userId: plan.user?.id || 0, plan: plan.plan });
			});
			setForm(formData);
			setIsLoading(false);
		})();

		return () => {
			isMounted = false;
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

	return (
		<Modal
			title={
				data?.[0]
					? `Планы продаж за ${format(
							parse(`${data[0].year}-${data[0].month}`, 'yyyy-MM', new Date()),
							'LLLL yyyy',
							{
								locale: customLocaleRu,
							}
					)}`
					: 'Планы продаж'
			}
			opened={modalStore.modals.crmReportRealizationPlanEdit}
			onClose={handleCloseModal}
			size={800}
			loading={isLoading}
		>
			{users && (
				<div className={css.wrapper}>
					{users.map((user, index) => {
						const isJanna = user.user?.firstName === 'Жанна' && user.user.lastName === 'Соколова';
						if (isJanna && user.plan === 0) return;

						const handleChange = (value: number) => {
							setForm((oldValue) => {
								const newValue = JSON.parse(JSON.stringify(oldValue));
								newValue[index].plan = value;
								return newValue;
							});
						};

						return (
							<div key={`planUserId${(index + user.userId!) * index ** 4}`} className={css.item}>
								<InputNumber
									label={
										isJanna
											? 'Уволенные сотрудники'
											: `${user.user?.lastName} ${user.user?.firstName}`
									}
									step={100000000}
									value={form[index]?.plan || 0}
									onChange={handleChange}
									disabled={isJanna || user.user?.isFired}
								/>
								{!isJanna && <StaffAvatar user={user.user!} disabled={user.user?.isFired} />}
							</div>
						);
					})}
				</div>
			)}

			<Modal.Buttons>
				<Button onClick={handleCloseModal}>Отмена</Button>
				<Button color="primary" variant="hard" onClick={handleSubmit}>
					Изменить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
});
