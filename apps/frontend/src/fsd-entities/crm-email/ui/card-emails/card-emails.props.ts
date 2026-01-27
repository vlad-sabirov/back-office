import { IEmailEntity, IEmailFormEntity } from "../../entity";

export interface ICardEmailsProps {
	emails: (IEmailEntity | IEmailFormEntity)[] | undefined;
}
