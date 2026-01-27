/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { ICrmOrganizationFormEntity } from "@fsd/entities/crm-organization";

type IChangeFields = { 
	field: any; 
	value?: any; 
	error?: any, 
};
type IChangeFieldsRedux = ActionCreatorWithPayload<IChangeFields>;
type IChangeFieldsCustom = (args: IChangeFields) => void;

export interface ICardInfo {
	value: ICrmOrganizationFormEntity[] | undefined;
	error?: string | undefined;
	data?: ICrmOrganizationFormEntity[] | undefined;
	onChange: IChangeFieldsRedux | IChangeFieldsCustom;
	changeField?: string;
	required?: boolean;
	isAdd?: boolean;
	isConnect?: boolean;
	isActions?: boolean;
	isDisplayPhones?: boolean;
	isDisplayEmails?: boolean;
	isDisplayInn?: boolean;
}
