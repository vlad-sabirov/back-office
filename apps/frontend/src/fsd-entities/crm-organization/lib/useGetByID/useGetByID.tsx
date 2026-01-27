import { useStateSelector } from '@fsd/shared/lib/hooks';

export const useGetByID = () => {
	const orgs = useStateSelector((state) => state.crm_organization.data.all);
	return (id: number) => orgs[id] ?? null;
};
