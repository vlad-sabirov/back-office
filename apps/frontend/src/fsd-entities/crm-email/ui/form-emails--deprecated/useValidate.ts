import { useCallback } from "react";
import { trim } from "lodash";
import { HelperValidate } from "@fsd/shared/lib/validate";
import { Const } from "../../config/const";
import { Service } from "../../model/service";
import { IFormEmailsProps } from "./form-emails.types";

export const useValidate = (props: IFormEmailsProps) => {
	const { value: values, data, required, onChange, changeField, ignoreEmails } = props;
	const [findDuplicate] = Service.findByEmail();

	return useCallback(async (): Promise<boolean> => {
		let count = 0;
		let index = -1;

		for (const item of values) {
			index++;
			const parsedEmail = trim(item.value).toLowerCase();
			if (!parsedEmail.length) {
				continue;
			}
			count++;

			// Неверный формат
			if (!HelperValidate.isEmail(parsedEmail)) {
				onChange({
					field: changeField,
					error: { [index]: Const.FormEmail.Validate.InvalidFormat }
				});
				return false;
			}

			// Поиск дубликата в массиве values
			if (values.some((item, i) => item.value === parsedEmail && i !== index)) {
				const dIndex = values.findIndex((item, i) => item.value === parsedEmail && i !== index);
				onChange({
					field: changeField,
					error: { [dIndex]: Const.FormEmail.Validate.FoundDuplicate }
				});
				return false;
			}

			// Поиск дубликата в массиве data
			if (data && data.some((item) => item.value === parsedEmail)) {
				onChange({
					field: changeField,
					error: { [index]: Const.FormEmail.Validate.FoundDuplicate }
				});
				return false;
			}

			// Поиск дубликата в базе
			const foundDuplicate = await findDuplicate({
				email: parsedEmail,
				ignoreEmails: ignoreEmails?.map((email) => email),
			});
			if (foundDuplicate.data?.length) {
				onChange({
					field: changeField,
					error: { [index]: Const.FormEmail.Validate.FoundDuplicate }
				});
				return false;
			}
		}

		// Если должен быть хотя-бы один телефон
		if (required && count < 1) {
			onChange({ field: changeField, error: { [0]: Const.FormEmail.Validate.IsRequired } });
			return false;
		}

		return true;
	}, [required, values, data, findDuplicate, ignoreEmails, onChange, changeField]);
};
