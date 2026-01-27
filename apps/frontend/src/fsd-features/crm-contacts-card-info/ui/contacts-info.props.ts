import { ICrmContactEntity } from "@fsd/entities/crm-contact";

export interface IContactsInfoProps {
	contacts: ICrmContactEntity[] | undefined;
	organizationId: number | string | null;
}
