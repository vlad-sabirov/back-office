import { FC } from 'react';
import { Error403 } from '@components/errors';
import { VacationAccess } from '@fsd/entities/vacation';
import { useAccess } from '@fsd/shared/lib/hooks';
import { Vacation } from '@screens/staff/vacation';

const Page: FC = () => {
	const asscess = useAccess({ access: VacationAccess.vacation });
	return asscess ? <Vacation /> : <Error403 />;
};
export default Page;
