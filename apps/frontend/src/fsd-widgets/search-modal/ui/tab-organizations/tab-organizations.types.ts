import { IUseSearchResponse } from "../../lib/useSearch/use-search.types";

export interface IOrganizationsProps {
	organizations: IUseSearchResponse[] | null;
	index: string;
	disabled: boolean;
	userId: number | string;
}
