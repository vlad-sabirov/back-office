/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { IEmailFormEntity } from "../../entity";

export interface IFormEmailsProps {
	value: IEmailFormEntity[];
	error: string | undefined;
	data?: IEmailFormEntity[];
	onChange: IOnChangeWithoutNull | IOnChangeWithNull;
	changeField: string;
	required?: boolean;
	ignoreEmails?: string[];
}

type IFields = { field: any; value?: any; error?: any };
type IOnChangeWithoutNull = ActionCreatorWithPayload<IFields>;
type IOnChangeWithNull = ActionCreatorWithPayload<IFields | null>;
