/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { IPhoneFormEntity } from "../../entity";

export interface IFormPhonesProps {
	value: IPhoneFormEntity[];
	error: string | undefined;
	data?: IPhoneFormEntity[];
	onChange: IOnChangeWithoutNull | IOnChangeWithNull;
	changeField: string;
	required?: boolean;
	isVoipSkip?: boolean;
	ignorePhones?: (number | string)[];
}

type IFields = { field: any; value?: any; error?: any };
type IOnChangeWithoutNull = ActionCreatorWithPayload<IFields>;
type IOnChangeWithNull = ActionCreatorWithPayload<IFields | null>;
