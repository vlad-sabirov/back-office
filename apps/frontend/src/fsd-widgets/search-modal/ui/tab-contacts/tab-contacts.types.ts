import { IUseSearchResponse } from "../../lib/useSearch/use-search.types";

export interface IContactsProps {
	contacts: IUseSearchResponse[] | null;
	index: string;
	disabled: boolean;
	userId: number | string;
}
