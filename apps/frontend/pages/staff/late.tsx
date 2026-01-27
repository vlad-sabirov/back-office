import { FC } from 'react';
import { Error403 } from '@components/errors';
import { LatenessAccess } from '@fsd/entities/lateness';
import { useAccess } from '@fsd/shared/lib/hooks';
import { LatenessScreen } from '@screens/staff/lateness/Lateness.screen';

const Page: FC = () => {
	const asscess = useAccess({ access: LatenessAccess.lateness });
	return asscess ? <LatenessScreen /> : <Error403 />;
};
export default Page;
