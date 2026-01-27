import { useStateSelector } from "@fsd/shared/lib/hooks";
import { FC } from "react";
import { Contact } from "./contact/Contact";
import { Organization } from "./organization/Organization";
import { Skeleton } from "./skeleton/Skeleton";

export const LeftSide: FC = () => {
	const isLoading = useStateSelector((state) => state.crm_card.isLoading);
	const type = useStateSelector((state) => state.crm_card.type);

	if (isLoading) {
		return <Skeleton />;
	}

	if (type === 'organization') {
		return <Organization />;
	}

	if (type === 'contact') {
		return <Contact />;
	}
		
	return null;
}
