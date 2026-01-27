import { IContactCardProps } from "../contact-card/contact-card.types";

export interface ISearchConnectProps extends Pick<IContactCardProps, 'onConnect'> {
	onClose: () => void;
}
