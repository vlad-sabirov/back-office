import { FC } from "react";
import cn from "classnames";
import { IOrganizationTableProps } from "../types/organization-table.props";
import css from "./organization-table.module.scss";
import { useStateSelector } from "@fsd/shared/lib/hooks";
import { ContentBlock, Table } from "@fsd/shared/ui-kit";
import { useDataToTable } from "../lib/useDataToTable";
import { OrganizationPagination } from "@fsd/features/crm-organization-pagination";

export const OrganizationTable: FC<IOrganizationTableProps> = (
	{ loading, className, ...props }
) => {
	const organizationData = useStateSelector((state) => state.crm_organization.data.list);
	const tableData = useDataToTable(organizationData);

	return (
		<div className={cn(css.wrapper, className)} {...props}>
			<ContentBlock withoutPaddingX loading={loading}>
				<Table data={tableData} />
				<div className={css.footer}>
					<OrganizationPagination />
				</div>
			</ContentBlock>
		</div>
	);
}
