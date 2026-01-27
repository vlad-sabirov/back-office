import { IContactCardProps } from "../contact-card/contact-card.types";

export type IUpdateModalProps = Pick<IContactCardProps, 'data' | 'onUpdate' | 'dataPhones' | 'dataEmails'>;
