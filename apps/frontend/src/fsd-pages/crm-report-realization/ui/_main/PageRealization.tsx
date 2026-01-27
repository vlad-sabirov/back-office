import { FC } from 'react';
import { CrmRealizationPlanCreateFeature } from '@fsd/features/crm-realization-plan-create';
import { CrmRealizationPlanListFeature } from '@fsd/features/crm-realization-plan-list';
import { CrmRealizationPlanUpdateFeature } from '@fsd/features/crm-realization-plan-update/';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Header } from '@fsd/shared/ui-kit';
import { CrmRealizationAnalyticsWidget } from '@fsd/widgets/crm-realization-analytics';
import { HeaderLeft } from '../header-left/HeaderLeft';
import { HeaderRight } from '../header-right/HeaderRight';

const PageRealization: FC = () => {
	const isLoading = useStateSelector((state) => state.crm_realization.isLoading);
	const isFetching = useStateSelector((state) => state.crm_realization.isFetching);

	return (
		<>
			<Header
				title={'Отчет о реализации'}
				contentLeft={<HeaderLeft />}
				contentRight={<HeaderRight />}
				loading={isLoading || isFetching}
			/>

			<CrmRealizationAnalyticsWidget />

			<CrmRealizationPlanListFeature />
			<CrmRealizationPlanCreateFeature />
			<CrmRealizationPlanUpdateFeature />
		</>
	);
};

export default PageRealization;
