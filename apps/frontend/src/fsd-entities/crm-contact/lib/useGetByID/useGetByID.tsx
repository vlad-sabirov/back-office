import { useStateSelector } from '@fsd/shared/lib/hooks';

export const useGetByID = () => {
	const contacts = useStateSelector((state) => state.crm_contact.data.all);
	return (id: number) => contacts[id] ?? null;
};
