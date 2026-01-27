import { useMemo } from 'react';
import { intersection } from 'lodash';
import { useUser } from '../use-user/use-user';

interface IAccessProps {
	access: string[];
	roles?: string[];
	ignoreAdmin?: boolean;
}

export const useAccess = ({ access, roles, ignoreAdmin = false }: IAccessProps): boolean | undefined => {
	const { getRoles } = useUser();
	const userRoles = getRoles();
	const accessArr = ignoreAdmin ? access : [...access, 'admin'];
	const isAccess = intersection(accessArr, roles || userRoles).length > 0;
	const result = useMemo(() => isAccess, [isAccess]);
	if (!userRoles && !roles) {
		return;
	}
	return result;
};
