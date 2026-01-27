import { FC, Suspense } from "react";
import { CrmOrganizationPage } from "@fsd/pages/crm-organization";
import { CrmContactPage } from "@fsd/pages/crm-contact";
import { ICrmHoc } from "../types/crm-hoc.props";

const CrmHoc: FC<ICrmHoc> = ({ type }) => {
	return (
		<Suspense>
			{type === 'organization' && <CrmOrganizationPage />}
			{type === 'contact' && <CrmContactPage />}
			{/* <CrmCard /> */}
		</Suspense>
	);
}

export default CrmHoc;
