import { FC, Suspense } from 'react';
import { CrmHoc } from '@fsd/process/crm';

const Page: FC = () => (
	<Suspense>
		<CrmHoc type={'contact'} />
	</Suspense>
);
export default Page;
