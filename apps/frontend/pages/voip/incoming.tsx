import { FC, Suspense } from 'react';
import { VoipIncomingPage } from '@fsd/pages/voip-incoming';

const Page: FC = () => (
	<Suspense>
		<VoipIncomingPage />
	</Suspense>
);
export default Page;
