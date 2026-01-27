import { FC, useMemo } from 'react';
import { CRM_REALIZATION_CONFIG, useCrmRealizationGetDataMonthAll } from '@fsd/entities/crm-realization';
import { ICrmReportInitialStateFormPlanCreate, useCrmRealizationActionsPage } from '@fsd/pages/crm-report-realization';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { DateMonthPicker, DateMonthPickerPropsValue } from '@fsd/shared/ui-kit';
import css from './date-picker.module.scss';

const MIN_DATE = CRM_REALIZATION_CONFIG.MIN_DATE;

export const DatePicker: FC = () => {
	const values = useStateSelector((state) => state.crm_realization_page.forms.planCreate);
	const errors = useStateSelector((state) => state.crm_realization_page.errors.planCreate);
	const formDate = useMemo(
		() => (values.year && values.month ? { year: values.year, month: values.month } : undefined),
		[values]
	);
	const actions = useCrmRealizationActionsPage();
	const planAll = useCrmRealizationGetDataMonthAll();

	const handleChangeDate = (value: DateMonthPickerPropsValue | null) => {
		if (!value) return;

		const foundPlan = planAll?.linkedList[`${value.year}-${value.month}`];

		if (foundPlan) {
			actions.setErrorPlanCreate({ date: 'План на этот месяц уже существует' });
		} else {
			actions.setErrorPlanCreate({ date: '' });
		}

		const updateForm: ICrmReportInitialStateFormPlanCreate = {
			teams: {},
		};
		planAll?.last?.downToTeams.toArray().forEach((teamReport) => {
			// eslint-disable-next-line
			updateForm.teams![teamReport.userId] = {
				userId: teamReport.userId,
				plan: teamReport.plan,
				planCustomerCount: teamReport.planCustomerCount,
				planWorkingBasePercent: teamReport.planWorkingBasePercent,
				employees: null,
			};
		});
		actions.setFormPlanCreate({ year: value.year, month: value.month, ...updateForm });
	};

	return (
		<DateMonthPicker
			label="Отчетный период"
			value={formDate}
			onChange={handleChangeDate}
			className={css.datePicker}
			error={errors.date}
			minDate={MIN_DATE}
			required
		/>
	);
};
