import { FC } from "react";
import { CrmOrganizationActions, CrmOrganizationConst } from "@fsd/entities/crm-organization";
import { useStateActions, useStateSelector } from "@fsd/shared/lib/hooks";
import { Pagination } from "@fsd/shared/ui-kit";
import { IOrganizationPaginationProps } from "./organization-pagination.props";

export const OrganizationPagination: FC<IOrganizationPaginationProps> = () => {
	const filterTotal = useStateSelector((state) => state.crm_organization.count.total);
	const filter = useStateSelector((state) => state.crm_organization.filter.list);
	const organizationActions = useStateActions(CrmOrganizationActions);

	const handleChangePage = (page: number) => {
		organizationActions.setFilterList({ ...filter, page });
	}

	const handleChangeLimit = (limit: number) => {
		localStorage.setItem(CrmOrganizationConst.localStorage.ListLimit, limit.toString());
		organizationActions.setFilterList({ ...filter, limit });
	}

	return (
		<div>
			<Pagination 
				total={filterTotal} 
				page={filter.page ? Number(filter.page) : 1} 
				limit={filter.limit ? Number(filter.limit) : 25}
				onChangePage={handleChangePage}
				onChangeLimit={handleChangeLimit}
			/>
		</div>
	);
};
