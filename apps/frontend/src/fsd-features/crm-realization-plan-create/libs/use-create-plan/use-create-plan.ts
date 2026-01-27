import { CrmRealizationService, ICrmRealizationMonthResTeam } from '@fsd/entities/crm-realization';
import { useCrmRealizationActionsPage } from '@fsd/pages/crm-report-realization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { showNotification } from '@mantine/notifications';

export const useCreatePlan = () => {
	const values = useStateSelector((state) => state.crm_realization_page.forms.planCreate);
	const actions = useCrmRealizationActionsPage();
	const [createPlanFetch] = CrmRealizationService.createMonth();

	return async (): Promise<boolean> => {
		if (!values.year || !values.month || !values.teams) {
			actions.setErrorPlanCreate({ date: 'Укажите дату' });
			return false;
		}

		const teams: ICrmRealizationMonthResTeam[] = Object.values(values.teams).map((teamValue) => {
			const teamData: ICrmRealizationMonthResTeam = {
				year: Number(values.year),
				month: Number(values.month),
				userId: teamValue.userId ?? 0,
				plan: teamValue.plan ?? 0,
				planCustomerCount: teamValue.planCustomerCount ?? 0,
				planWorkingBasePercent: teamValue.planWorkingBasePercent ?? 0,
				employees: [],
			};

			Object.values(teamValue.employees || {}).forEach((employeeReport) => {
				teamData.employees?.push({
					year: Number(values.year),
					month: Number(values.month),
					userId: employeeReport.userId ?? 0,
					plan: employeeReport.plan ?? 0,
					planCustomerCount: employeeReport.planCustomerCount ?? 0,
					planWorkingBasePercent: employeeReport.planWorkingBasePercent ?? 0,
				});
			});

			return teamData;
		});

		actions.setIsFetching(true);
		const response = await createPlanFetch({
			year: Number(values.year),
			month: Number(values.month),
			teams,
		});

		if ('error' in response) {
			showNotification({
				color: 'red',
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				message: response.error.data.message ?? 'Неизвестная ошибка, обратитесь в IT отдел',
			});
			actions.setIsFetching(false);
			return false;
		}

		actions.setIsFetching(false);
		return true;
	};
};
