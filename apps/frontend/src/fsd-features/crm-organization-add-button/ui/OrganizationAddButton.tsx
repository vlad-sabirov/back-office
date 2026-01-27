import { FC, useCallback } from "react";
import { Button, Icon } from "@fsd/shared/ui-kit";
import { IOrganizationAddButtonProps } from "./organization-add-button.props";
import { useCrmOrganizationAddDrawerActions } from "@fsd/widgets/crm-organization-add-drawer";

export const OrganizationAddButton: FC<IOrganizationAddButtonProps> = (
	{ loading }
) => {
	const actions = useCrmOrganizationAddDrawerActions();

	const handleModalOpen = useCallback(() => {
		actions.setIsShow(true);
	}, [actions]);

	return (
		<>
			<Button
				color={'info'}
				iconLeft={<Icon name={'plus-medium'} style={{ width: 12 }} />}
				disabled={loading}
				onClick={handleModalOpen}
			> Компания </Button>
		</>
	);
}
