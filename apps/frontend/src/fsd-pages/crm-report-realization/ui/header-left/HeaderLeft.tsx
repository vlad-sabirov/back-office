import { FC } from "react";
import { IHeaderLeftProps } from './header-left.types';
import { CrmRealizationFilterFeature } from "@fsd/features/crm-realization-filter";

export const HeaderLeft: FC<IHeaderLeftProps> = () => {
	return <CrmRealizationFilterFeature />;
}
