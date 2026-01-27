import { FC, useCallback } from 'react';
import cn from 'classnames';
import { format, parse } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { CRM_REALIZATION_COLORS, useCrmRealizationGetDataMonthAll } from '@fsd/entities/crm-realization';
import { IMonthResTeam } from '@fsd/entities/crm-realization/api/res';
import { useActions } from '@fsd/pages/crm-report-realization/libs';
import { IFormTeams } from '@fsd/pages/crm-report-realization/model/initial.types';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import css from './crm-realization-plan-list.module.scss';

export const CrmRealizationPlanList: FC = () => {
	const isShowModal = useStateSelector((state) => state.crm_realization_page.modals.planList);
	const isFetching = useStateSelector((state) => state.crm_realization_page.isFetching);
	const actions = useActions();
	const planList = useCrmRealizationGetDataMonthAll()?.toArray() ?? [];

	const handleModalClose = useCallback(() => {
		actions.setModal(['planList', false]);
	}, [actions]);

	const handleModalCreate = useCallback(() => {
		actions.setModal(['planCreate', true]);
	}, [actions]);

	const handleModalUpdate = useCallback(
		(year: number, month: number, teams: IMonthResTeam[] | undefined) => {
			if (teams == undefined) {
				return;
			}

			const teamsMap: Record<number, IFormTeams> = teams.reduce((acc, team) => {
				acc[team.userId] = {
					userId: team.userId,
					plan: team.plan,
					planCustomerCount: team.planCustomerCount,
					planWorkingBasePercent: team.planWorkingBasePercent,
				};
				return acc;
			}, {} as Record<number, IFormTeams>);

			actions.setModal(['planUpdate', true]);
			actions.setFormPlanUpdate({
				year: String(year),
				month: String(month),
				teams: teamsMap,
			});
		},
		[actions]
	);

	return (
		<Modal title={'Планы продаж'} opened={isShowModal} onClose={handleModalClose} loading={isFetching} size={440}>
			<div className={css.root}>
				{planList.map((item) => {
					const date = format(parse(`${item.year}-${item.month}`, 'yyyy-MM', new Date()), 'LLLL yyyy', {
						locale: customLocaleRu,
					});
					return (
						<div
							key={`${item.year}-${item.month}`}
							className={css.item}
							onClick={() => {
								handleModalUpdate(item.year, item.month, item.teams);
							}}
						>
							<TextField className={css.date}> {date} </TextField>

							<TextField className={css.plan}>
								{Intl.NumberFormat('ru-RU').format(item.plan ?? 0)}
								{!!item.percent && (
									<span
										className={cn(css.percent, {
											[css.percent__red]: item.percent < CRM_REALIZATION_COLORS.RED,
											[css.percent__yellow]:
												item.percent >= CRM_REALIZATION_COLORS.RED &&
												item.percent < CRM_REALIZATION_COLORS.YELLOW,
											[css.percent__green]: item.percent >= CRM_REALIZATION_COLORS.YELLOW,
										})}
									>
										{item.percent}%
									</span>
								)}
							</TextField>
						</div>
					);
				})}
			</div>
			<Modal.Buttons>
				<Button onClick={handleModalClose}> Отмена </Button>

				<Button
					color={'primary'}
					variant={'hard'}
					type={'submit'}
					iconLeft={<Icon name={'plus-medium'} style={{ width: 12 }} />}
					onClick={handleModalCreate}
				>
					Добавить
				</Button>

				<Button
					color={'primary'}
					variant={'hard'}
					type={'submit'}
					size={'extraLarge'}
					onClick={handleModalCreate}
					className={css.floatingButton}
				>
					<Icon name={'plus-medium'} style={{ width: 12 }} />
				</Button>
			</Modal.Buttons>
		</Modal>
	);
};
