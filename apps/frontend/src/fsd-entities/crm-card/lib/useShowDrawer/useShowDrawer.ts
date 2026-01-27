import { useShowContact } from './useShowContact';
import { useShowOrganization } from './useShowOrganization';
import { Types } from '../../config/enums';

interface IExec {
	type: Types;
	id: number | string;
}

export const useShowDrawer = () => {
	const execOrg = useShowOrganization();
	const execCont = useShowContact();

	return ({ type, id }: IExec) => {
		if (type === 'organization') {
			execOrg({ id });
		}
		if (type === 'contact') {
			execCont({ id });
		}
	};
};
