import { FC, Suspense } from 'react';
import { VoipOutgoingPage } from '@fsd/pages/voip-outgoing';

const Page: FC = () => (
	<Suspense>
		<VoipOutgoingPage />
	</Suspense>
);
export default Page;
