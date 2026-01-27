import { FC } from "react";
import { Button, Icon, Menu } from "@fsd/shared/ui-kit";
import { IOrganizationSettingsProps } from "../types/organization-settings.props";
import { useStateActions } from "@fsd/shared/lib/hooks";
import { CrmOrganizationTypeActions } from "@fsd/entities/crm-organization-type";
import { useCrmOrganizationTagActions } from "@fsd/entities/crm-organization-tag";

export const OrganizationSetting: FC<IOrganizationSettingsProps> = (
	{ loading }
) => {
	const typeActions = useStateActions(CrmOrganizationTypeActions);
	const tagActions = useCrmOrganizationTagActions();

	return (
		<>
			<Menu
				control={(
					<Button
					color={'primary'}
					iconLeft={<Icon name={'settings'} />}
					disabled={loading}
					> Настройки </Button>
				)}
				offset={-8}
				arrowOffset={12}
				position={'bottom-end'}
				withArrow
			>
				<Menu.Item
					onClick={() => typeActions.setModalShow({ modal: 'list', show: true })}
				> Виды деятельности </Menu.Item>

				<Menu.Item
					onClick={() => tagActions.setModalShow({ modal: 'list', show: true })}
				> Теги </Menu.Item>
			</Menu>
		</>
	);
}
