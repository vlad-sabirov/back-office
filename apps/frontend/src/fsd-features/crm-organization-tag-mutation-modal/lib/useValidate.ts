import { CrmOrganizationTagService } from "@fsd/entities/crm-organization-tag";
import { stringFormatToLetters } from "@fsd/shared/lib/string-format";
import { trim } from "lodash";
import { Const } from "../const/const";
import { IValidateProps } from "../types/validate.props";

export const useValidate = () => {
	const [getOnce] = CrmOrganizationTagService.getOnce();

	return async ({ form, ignoreId }: IValidateProps): Promise<boolean> => {
		const { name } = form.values;
		const newName = trim(name.toLowerCase());
		const gluedName = stringFormatToLetters(name);

		if (gluedName.length < Const.Validate.MinLength.Value) {
			form.setFieldError("name", Const.Validate.MinLength.ErrorMessage);
			return false;
		}

		if (newName.length > Const.Validate.MaxLength.Value) {
			form.setFieldError("name", Const.Validate.MaxLength.ErrorMessage);
			return false;
		}

		const foundDuplicate = await getOnce({
			where: {
				id: ignoreId ? { not: ignoreId } : undefined,
				name: newName,
			}
		});
		if (foundDuplicate.data) {
			form.setFieldError("name", Const.Validate.FoundDuplicate);
			return false;
		}
		return true;
	};
}
