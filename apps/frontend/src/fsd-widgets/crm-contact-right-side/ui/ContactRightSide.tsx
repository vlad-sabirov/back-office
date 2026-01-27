import { FC } from "react";
import { IOrganizationRightSideProps } from "./contact-right-side.props";
import { CrmContactAddButton } from "@fsd/features/crm-contact-add-button";

export const ContactRightSide: FC<IOrganizationRightSideProps> = (
	{ loading }
) => {
	return (
		<>
			<CrmContactAddButton loading={loading} />
		</>
	);
}
