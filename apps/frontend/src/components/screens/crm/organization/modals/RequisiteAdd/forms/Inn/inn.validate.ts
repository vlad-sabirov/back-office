import { CrmOrganizationRequisiteService } from "@services";
import { InnValidateProps, INN_CONSTANTS } from ".";

export const innValidate = async (
	{ form, hasData }: InnValidateProps
): Promise<true | undefined>  => {
	const { inn } = form.values;
	const formattedInn = inn.replace(/\D/g, '');

	if (!formattedInn.length) {
		form.setFieldError(
			INN_CONSTANTS.FIELD_NAME, 
			INN_CONSTANTS.VALIDATION.IS_EMPTY
		);
		return;
	}

	if (formattedInn.length !== 9) {
		form.setFieldError(
			INN_CONSTANTS.FIELD_NAME, 
			INN_CONSTANTS.VALIDATION.WRONG_LENGTH
		);
		return;
	}

	if (hasData?.some((hasDataItem) => hasDataItem.inn === formattedInn)) {
		form.setFieldError(
			INN_CONSTANTS.FIELD_NAME, 
			INN_CONSTANTS.VALIDATION.ALREADY_EXISTS
		);
		return;
	}

	const [foundDuplicate] = await CrmOrganizationRequisiteService.findOnce({
		where: { inn: formattedInn }
	});
	if (foundDuplicate) {
		form.setFieldError(
			INN_CONSTANTS.FIELD_NAME, 
			INN_CONSTANTS.VALIDATION.ALREADY_EXISTS
		);
		return;
	}

	return true;
}
