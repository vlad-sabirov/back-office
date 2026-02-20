import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { LatenessAccess } from '@fsd/entities/lateness';
import { CrmRealizationDashboard } from '@fsd/features/crm-realization-dashboard';
import { CrmWorkingBaseDashboardWidget } from '@fsd/widgets/crm-working-base-dashboard';
import { CrmUpcomingTransitionsWidget } from '@fsd/widgets/crm-upcoming-transitions';
import { CrmStaffPowerOverviewWidget } from '@fsd/widgets/crm-staff-power-overview';
import { TodayPlan } from '@fsd/widgets/calendar-today-plan';
import { useAccess, useUserDeprecated } from '@hooks';
import { Grid } from '@mantine/core';
import { LogisticVedDashboardAuthor, LogisticVedDashboardBoss } from '@screens/logistic/ved/dashboard';
import { LogisticVedDashboardCalculate, LogisticVedDashboardVed } from '@screens/logistic/ved/dashboard';
import { BirthdayToday, BirthdayUpcoming, StaffCount } from '@screens/staff';
import { LatenessTodayDashboard } from '@screens/staff/lateness';
import css from './styles.module.scss';

export const Dashboard: FC = observer(() => {
	const CheckAccess = useAccess();
	const { rolesAlias } = useUserDeprecated();
	const isBoss = CheckAccess(['developer', 'boss', 'crmAdmin']);

	return (
		<>
			<Head>
				<title>Обзорная панель. Back Office</title>
			</Head>

			<div className={css.root}>
				<CrmRealizationDashboard />

				<Grid gutter={20} columns={100} className={css.grid} grow>
					{/*<Mock count={40} />*/}
					<TodayPlan />
					{CheckAccess(LatenessAccess.lateness) && <LatenessTodayDashboard />}
					<BirthdayToday />

					{rolesAlias?.includes('crm') && <CrmWorkingBaseDashboardWidget />}
					{rolesAlias?.includes('crm') && <CrmUpcomingTransitionsWidget />}
					{/* TODO: вернуть позже — виджет "Организации сотрудников" для crmAdmin */}
					{/* {CheckAccess(['crmAdmin', 'boss', 'developer']) && <CrmStaffPowerOverviewWidget />} */}
					{isBoss ? (
						<LogisticVedDashboardBoss />
					) : (
						<>
							{rolesAlias?.includes('logisticVedOrdersAuthor') && <LogisticVedDashboardAuthor />}
							{rolesAlias?.includes('logisticVedOrdersVed') && <LogisticVedDashboardVed />}
							{rolesAlias?.includes('logisticVedOrdersCalculate') && <LogisticVedDashboardCalculate />}
						</>
					)}

					<BirthdayUpcoming />
					<StaffCount />
				</Grid>
			</div>
		</>
	);
});
