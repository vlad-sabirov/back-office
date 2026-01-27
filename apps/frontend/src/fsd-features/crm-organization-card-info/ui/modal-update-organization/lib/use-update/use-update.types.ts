import { ICrmEmailFormEntity } from '@fsd/entities/crm-email';
import { ICrmPhoneFormEntity } from '@fsd/entities/crm-phone';

export interface ICreateHistoryProps {
	oldVal: string;
	newVal: string;
	field: 'nameEn' | 'nameRu' | 'userId' | 'typeId' | 'website' | 'tags' | 'comment' | 'color';
}

export interface IUpdatePhonesProps {
	oldVal: ICrmPhoneFormEntity[];
	newVal: ICrmPhoneFormEntity[];
}

export interface IUpdateEmailsProps {
	oldVal: ICrmEmailFormEntity[];
	newVal: ICrmEmailFormEntity[];
}

export interface ICreateHistoryUser {
	id: number;
	firstName: string;
	lastName: string;
}
