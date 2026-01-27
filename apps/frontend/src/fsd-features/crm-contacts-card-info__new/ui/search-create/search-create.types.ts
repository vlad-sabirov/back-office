import { IContactCardProps } from "../contact-card/contact-card.types";

export interface ISearchCreateProps
	extends Pick<IContactCardProps, 'data' | 'dataPhones' | 'dataEmails' | 'onCreate'> {
	onClose: () => void;
}
