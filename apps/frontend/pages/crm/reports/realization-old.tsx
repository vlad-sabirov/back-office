// import { CrmReportRealization } from "@fsd/widgets/crm-report-realization";
import { FC, Suspense } from 'react';
import { CrmReportRealization } from '@screens/crm/reports/realization';

const Page: FC = () => (
	<Suspense>
		<CrmReportRealization />
	</Suspense>
);
export default Page;
