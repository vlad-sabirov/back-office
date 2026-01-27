import { CrmOrganizationRequisiteService } from "@services";
import { NameValidateProps, NAME_CONSTANTS } from ".";

export const nameValidate = async (
	{ form, hasData }: NameValidateProps
): Promise<true | undefined>  => {
	const { name } = form.values;
	const formattedName = name.trim();

	if (!formattedName.length) {
		form.setFieldError(
			NAME_CONSTANTS.FIELD_NAME, 
			NAME_CONSTANTS.VALIDATION.IS_EMPTY
		);
		return;
	}

	if (formattedName.length < 3) {
		form.setFieldError(
			NAME_CONSTANTS.FIELD_NAME, 
			NAME_CONSTANTS.VALIDATION.WRONG_LENGTH
		);
		return;
	}

	if (hasData?.some((hasDataItem) => hasDataItem.name === formattedName)) {
		form.setFieldError(
			NAME_CONSTANTS.FIELD_NAME, 
			NAME_CONSTANTS.VALIDATION.ALREADY_EXISTS
		);
		return;
	}
	
	const [foundDuplicate] = await CrmOrganizationRequisiteService.findOnce({
		where: { name: formattedName }
	});	
	if (foundDuplicate) {
		form.setFieldError(
			NAME_CONSTANTS.FIELD_NAME, 
			NAME_CONSTANTS.VALIDATION.ALREADY_EXISTS
		);
		return;
	}

	return true;
}
