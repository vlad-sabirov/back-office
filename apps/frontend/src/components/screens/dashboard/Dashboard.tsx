import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import { LatenessAccess } from '@fsd/entities/lateness';
import { CrmRealizationDashboard } from '@fsd/features/crm-realization-dashboard';
import { CrmWorkingBaseDashboardWidget } from '@fsd/widgets/crm-working-base-dashboard';
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
					{CheckAccess(LatenessAccess.lateness) && <LatenessTodayDashboard />}
					<BirthdayToday />

					{rolesAlias?.includes('crm') && <CrmWorkingBaseDashboardWidget />}
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
