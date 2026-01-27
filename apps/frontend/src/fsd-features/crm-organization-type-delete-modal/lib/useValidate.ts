import { CrmOrganizationTypeService } from "@fsd/entities/crm-organization-type";
import { showNotification } from "@mantine/notifications";
import { Const } from "../const/const";

export const useValidate = () => {
	const [getById] = CrmOrganizationTypeService.getById();

	return async ({ id }: { id: number | string }) => {
		const foundType = await getById(id);
		if (!foundType.data) {
			showNotification({
				color: 'red',
				message: Const.Validate.NotFound,
			});
			return false;
		}

		return true;
	};
}
