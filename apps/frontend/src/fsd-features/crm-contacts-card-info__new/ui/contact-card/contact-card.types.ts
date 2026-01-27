import { ICrmContactFormEntity } from "@fsd/entities/crm-contact/entity";
import { ICrmPhoneFormEntity } from "@fsd/entities/crm-phone";

export interface IContactCardProps {
	data: ICrmContactFormEntity[];
	dataPhones?: ICrmPhoneFormEntity[];
	dataEmails?: ICrmPhoneFormEntity[];
	onCreate?: (val: ICrmContactFormEntity) => void;
	onConnect?: (val: ICrmContactFormEntity) => void;
	onDisconnect?: (val: ICrmContactFormEntity) => void;
	onUpdate?: (val: ICrmContactFormEntity) => void;
	displayPhones?: boolean;
	displayEmails?: boolean;
	displayWorkPosition?: boolean;
	canOpenCard?: boolean;
	required?: boolean;
}
