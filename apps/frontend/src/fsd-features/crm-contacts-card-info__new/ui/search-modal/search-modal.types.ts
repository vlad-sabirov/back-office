import { IContactCardProps } from "../contact-card/contact-card.types";

export interface ISearchModalProps
	extends Pick<IContactCardProps, 'onConnect' | 'onCreate' | 'data' | 'dataPhones' | 'dataEmails'> {}
