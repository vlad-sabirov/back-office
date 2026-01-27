import { FC } from "react";
import { CrmContactActions, CrmContactConst } from "@fsd/entities/crm-contact";
import { useStateActions, useStateSelector } from "@fsd/shared/lib/hooks";
import { Pagination } from "@fsd/shared/ui-kit";
import { IContactPaginationProps } from "./contact-pagination.props";

export const ContactPagination: FC<IContactPaginationProps> = () => {
	const filterTotal = useStateSelector((state) => state.crm_contact.count.total);
	const filter = useStateSelector((state) => state.crm_contact.filter.list);
	const contactActions = useStateActions(CrmContactActions);

	const handleChangePage = (page: number) => {
		contactActions.setFilterList({ ...filter, page });
	}

	const handleChangeLimit = (limit: number) => {
		localStorage.setItem(CrmContactConst.localStorage.ListLimit, limit.toString());
		contactActions.setFilterList({ ...filter, limit });
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
