import { FC, useCallback } from "react";
import { Button, Icon } from "@fsd/shared/ui-kit";
import { IContactAddButtonProps } from "./contact-add-button.props";
import { useStateActions } from "@fsd/shared/lib/hooks";
import { CrmContactActions } from "@fsd/entities/crm-contact";

export const ContactAddButton: FC<IContactAddButtonProps> = (
	{ loading }
) => {
	const actions = useStateActions(CrmContactActions);

	const handleClick = useCallback(() => {
		actions.setModalShow({ modal: 'search', show: true })
	}, [actions]);

	return (
		<Button
			color={'info'}
			iconLeft={<Icon name={'plus-medium'} style={{ width: 12 }} />}
			disabled={loading}
			onClick={handleClick}
		> Контакт </Button>
	);
}
