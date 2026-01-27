import { IContactCardSliceFormSearch } from "../../model/slice/contact-card-slice.types";
import { IContactCardProps } from "../contact-card/contact-card.types";

export interface ISearchFormProps extends Pick<IContactCardProps, 'data'> {
	onClose: () => void;
}

export interface ISearchFormValidate {
	setErrorName: (val: string | null) => void;
	setErrorPhone: (val: string | null) => void;
}

export interface ISearchModalChangeForm {
	field: keyof IContactCardSliceFormSearch;
	value: string;
}
