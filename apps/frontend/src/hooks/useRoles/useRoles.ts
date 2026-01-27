import { useStateSelector } from '@fsd/shared/lib/hooks';

export const useRoles = () => {
	const roles = useStateSelector((state) => state.app.auth.roles);
	return roles || [];
};
