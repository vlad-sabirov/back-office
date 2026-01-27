import { CrmOrganizationTagService } from "@fsd/entities/crm-organization-tag";
import { showNotification } from "@mantine/notifications";
import { Const } from "../const/const";

export const useValidate = () => {
	const [getById] = CrmOrganizationTagService.getById();

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
