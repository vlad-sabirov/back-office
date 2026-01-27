import { FC } from "react";
import cn from "classnames";
import { IContactTableProps } from "../types/contact-table.props";
import css from "./contact-table.module.scss";
import { useStateSelector } from "@fsd/shared/lib/hooks";
import { ContentBlock, Table } from "@fsd/shared/ui-kit";
import { useDataToTable } from "../lib/useDataToTable";
import { ContactPagination } from "@fsd/features/crm-contact-pagination";

export const ContactTable: FC<IContactTableProps> = (
	{ loading, className, ...props }
) => {
	const contactData = useStateSelector((state) => state.crm_contact.data.list);
	const tableData = useDataToTable(contactData)

	return (
		<div className={cn(css.wrapper, className)} {...props}>
			<ContentBlock withoutPaddingX loading={loading}>
				<Table data={tableData} />
				<div className={css.footer}>
					<ContactPagination />
				</div>
			</ContentBlock>
		</div>
	);
}
