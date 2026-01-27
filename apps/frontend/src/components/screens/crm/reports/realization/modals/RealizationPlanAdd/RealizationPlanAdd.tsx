/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FC, useContext, useEffect, useState } from 'react';
import { IForm } from './interfaces';
import cn from 'classnames';
import { format, parse, subMonths } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { convert as convertNumberToWordsRu } from 'number-to-words-ru';
import { customLocaleRu } from '@config/date-fns.locale';
import { StaffAvatar } from '@fsd/entities/staff';
import { Button, DateMonthPicker, DateMonthPickerPropsValue, InputNumber, Modal, TextField } from '@fsd/shared/ui-kit';
import { MainContext } from '@globalStore';
import { NumberFormat } from '@helpers/NumberFormat';
import { ReportRealizationResponse } from '@interfaces';
import { HoverCard } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { FilterPeriodType, ReportRealizationContext } from '@screens/crm/reports/realization';
import { ReportRealizationService } from '@services';
import UserService from '@services/User.service';
import css from './styles.module.scss';

export const RealizationPlanAdd: FC = observer(() => {
	const { modalStore } = useContext(MainContext);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [users, setUsers] = useState<ReportRealizationResponse[]>([]);
	const [oldReports, setOldReports] = useState<ReportRealizationResponse[]>([]);
	const [form, setForm] = useState<IForm[]>([]);
	const [calculate, setCalculate] = useState<number>(0);
	const [date, setDate] = useState<DateMonthPickerPropsValue | null>(null);
	const [dateError, setDateError] = useState<string | null>(null);
	const { realizationStore, realizationMonthStore, realizationQuarterStore, realizationYearStore } =
		useContext(ReportRealizationContext);
	const isFilledDate = date && date.year && date.month;

	const handleCloseModal = () => {
		setIsLoading(false);
		modalStore.modalOpen('crmReportRealizationPlanAdd', false);
		setDate(null);
		setDateError(null);
	};

	const handleSubmit = async () => {
		if (!date?.year || !date?.month || !form.length) return;
		setIsLoading(true);

		const [findDuplicate] = await ReportRealizationService.findMany({
			where: { year: date.year, month: date.month },
		});
		if (findDuplicate?.length) {
			showNotification({
				message: `План на ${format(parse(`${date.year}-${date.month}`, 'yyyy-MM', new Date()), 'LLLL yyyy', {
					locale: customLocaleRu,
				})} уже существует.`,
				color: 'red',
			});
			setDateError(' ');
			setIsLoading(false);
			return;
		}

		try {
			for (const itemUser of users) {
				if (!itemUser.userId) continue;
				const [, error] = await ReportRealizationService.create({
					createDto: {
						userId: itemUser.userId ?? 0,
						year: date.year,
						month: date.month,
						plan: form.find((item) => item.userId === itemUser.userId)?.plan ?? 0,
						realization: 0,
						customerCount: 0,
						customerShipment: 0,
						shipmentCount: 0,
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
					Вы только что добавили план за{' '}
					{format(parse(`${date.year}-${date.month}`, 'yyyy-MM', new Date()), 'LLLL yyyy', {
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
		let calc = 0;
		if (form) form.forEach((plan) => (plan.plan ? (calc += plan.plan) : null));
		setCalculate(calc);
	}, [form]);

	useEffect(() => {
		if (!modalStore.modals.crmReportRealizationPlanAdd) return;
		let isMounted = true;

		(async () => {
			setIsLoading(true);
			const [usersResponse] = await UserService.findSeniorSales();

			if (usersResponse) {
				const userData: ReportRealizationResponse[] = usersResponse.map((user) => ({
					id: 0,
					year: 0,
					month: 0,
					plan: 0,
					realization: 0,
					customerCount: 0,
					customerShipment: 0,
					shipmentCount: 0,
					userId: user.id,
					user: user,
					createdAt: new Date(),
					updatedAt: new Date(),
				}));

				if (userData && isMounted) {
					if (isMounted) setUsers(userData);

					const formData: IForm[] = [];
					for (const plan of userData) {
						formData.push({ userId: plan.userId || 0, plan: plan.plan });
					}
					if (isMounted) setForm(formData);
				}
			}

			const [oldReportsResponse] = await ReportRealizationService.findMany({
				//subMonths(realizationStore.maxRealizationDate, 3)
				where: {
					year: { gte: format(subMonths(realizationStore.maxRealizationDate || new Date(), 3 - 1), 'yyyy') },
					month: { gte: format(subMonths(realizationStore.maxRealizationDate || new Date(), 3 - 1), 'MM') },
				},
				filter: {
					orderBy: [{ year: 'desc' }, { month: 'desc' }],
				},
			});
			if (oldReportsResponse && isMounted) setOldReports(oldReportsResponse);
			setIsLoading(false);
		})();

		return () => {
			isMounted = false;
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [modalStore.modals.crmReportRealizationPlanAdd]);

	return (
		<Modal
			title="Добавление плана продаж"
			opened={modalStore.modals.crmReportRealizationPlanAdd}
			onClose={handleCloseModal}
			size={800}
			loading={isLoading}
		>
			<div className={css.wrapper}>
				<DateMonthPicker
					label="Отчетный период"
					className={css.date}
					value={date || undefined}
					onChange={async (date) => {
						if (!date) return;
						setDate(date);
						setDateError(null);

						const [findDuplicate] = await ReportRealizationService.findMany({
							where: { year: date.year, month: date.month },
						});
						if (findDuplicate?.length) {
							setDateError(
								`План на ${format(
									parse(`${date.year}-${date.month}`, 'yyyy-MM', new Date()),
									'LLLL yyyy',
									{
										locale: customLocaleRu,
									}
								)} уже существует.`
							);
						}
					}}
					error={dateError}
					required
				/>

				<div className={css.calculate}>
					{calculate > 0 && (
						<>
							<TextField className={css.calculate__toWords} size="small">
								{convertNumberToWordsRu(calculate, {
									currency: {
										currencyNameCases: ['', '', ''],
										fractionalPartNameCases: ['', '', ''],
										currencyNounGender: {
											integer: 2,
											fractionalPart: 0,
										},
									},
									showNumberParts: {
										fractional: false,
									},
								})}
							</TextField>

							<TextField className={css.calculate__calculate} mode="heading" size="large">
								{NumberFormat(calculate)}
							</TextField>
						</>
					)}
				</div>

				<div className={css.userWrapper}>
					{users &&
						users.map((user, index) => {
							const isJanna = user.user?.firstName === 'Жанна' && user.user.lastName === 'Соколова';
							if (isJanna && user.plan === 0) return;
							const handleChange = (value: number) => {
								setForm((oldValue) => {
									const newValue = JSON.parse(JSON.stringify(oldValue));
									newValue[index].plan = value;
									return newValue;
								});
							};
							const myOldReports = oldReports?.filter((item) => item.userId === user.userId);
							const myOldReportsDiff = myOldReports?.length
								? form[index]?.plan - myOldReports[0].plan
								: 0;

							return (
								<div key={`planUserId${(index + user.userId!) * index ** 4}`} className={css.item}>
									<HoverCard
										width={320}
										shadow="md"
										closeDelay={0}
										transition={'pop-top-left'}
										radius={'md'}
										position={index % 2 === 0 ? 'left-start' : 'right-start'}
									>
										<HoverCard.Target>
											<div className={cn({ [css.avatarDisabled]: !isFilledDate || dateError })}>
												<InputNumber
													label={
														<p>
															{user.user?.lastName} {user.user?.firstName}
															{!!myOldReportsDiff &&
																form[index]?.plan > 0 &&
																NumberFormat(myOldReportsDiff, {
																	operator: true,
																	sup: true,
																})}
														</p>
													}
													step={100000000}
													min={0}
													value={form[index]?.plan || undefined}
													onChange={handleChange}
													disabled={!isFilledDate || !!dateError}
												/>
												<StaffAvatar user={user.user!} disabled={user.user?.isFired} />
											</div>
										</HoverCard.Target>

										<HoverCard.Dropdown>
											<div className={css.hoverCard__wrapper}>
												<TextField className={css.hoverCard__name} size="large">
													{user.user?.lastName} {user.user?.firstName}
												</TextField>
												{myOldReports &&
													myOldReports.map((oldReport) => {
														const date = format(
															parse(
																`${oldReport.year}-${oldReport.month}`,
																'yyyy-MM',
																new Date()
															),
															'LLLL yyyy',
															{ locale: customLocaleRu }
														);
														const percent = oldReport.realization
															? Math.round((oldReport.realization / oldReport.plan) * 100)
															: 0;

														return (
															<div
																key={`oldReport${oldReport.id}`}
																className={css.hoverCard__item}
															>
																<TextField className={css.hoverCard__date}>
																	{date}
																</TextField>

																<TextField className={css.hoverCard__plan} size="small">
																	- План: <span>{NumberFormat(oldReport.plan)}</span>
																</TextField>

																{!!oldReport.realization && (
																	<TextField
																		className={css.hoverCard__realization}
																		size="small"
																	>
																		- Реализация:{' '}
																		<span>
																			{NumberFormat(oldReport.realization)}
																		</span>
																	</TextField>
																)}

																{!!percent && (
																	<TextField
																		className={css.hoverCard__percent}
																		size="small"
																	>
																		- Процент выполнения плана:{' '}
																		<span>{percent}%</span>
																	</TextField>
																)}
															</div>
														);
													})}
											</div>
										</HoverCard.Dropdown>
									</HoverCard>
								</div>
							);
						})}
				</div>
			</div>

			<Modal.Buttons>
				<Button onClick={handleCloseModal}>Отмена</Button>
				<Button color="primary" variant="hard" onClick={handleSubmit} disabled={calculate === 0}>
					Добавить
				</Button>
			</Modal.Buttons>
		</Modal>
	);
});
