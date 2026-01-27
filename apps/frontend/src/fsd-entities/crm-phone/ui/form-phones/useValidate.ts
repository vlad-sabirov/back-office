import { useCallback } from "react";
import { parsePhoneNumber } from "@fsd/shared/lib/parsePhoneNumber";
import { Const } from "../../config/const";
import { Service } from "../../model/service";
import { IFormPhonesProps } from "./form-phones.types";

export const useValidate = (props: IFormPhonesProps) => {
	const { value: values, data, isVoipSkip, required, onError, ignorePhones } = props;
	const [findDuplicate] = Service.findByPhone();

	return useCallback(async (): Promise<boolean> => {
		let count = 0;
		let index = -1;

		for (const item of values) {
			index++;
			const parsedPhone = parsePhoneNumber(item.value);
			if (!parsedPhone.clear) {
				continue;
			}
			count++;

			// Проверка на voip телефон
			if (String(parsedPhone.clear).length === 3 && !isVoipSkip) {
				onError({ [index]: Const.FormPhone.Validate.InvalidFormat });
				return false;
			}

			// Неверный формат
			if (!parsedPhone.valid) {
				onError({ [index]: Const.FormPhone.Validate.InvalidFormat });
				return false;
			}

			// Поиск дубликата в массиве values
			if (values.some((item, i) => item.value === parsedPhone.clear && i !== index)) {
				const dIndex = values.findIndex((item, i) => item.value === parsedPhone.clear && i !== index);
				onError({ [dIndex]: Const.FormPhone.Validate.FoundDuplicate });
				return false;
			}

			// Поиск дубликата в массиве data
			if (data && data.some((item) => item.value === parsedPhone.clear)) {
				if (!ignorePhones || !ignorePhones.includes(item.value)) {
					onError({ [index]: Const.FormPhone.Validate.FoundDuplicate });
					return false;
				}
			}

			// Поиск дубликата в базе
			const foundDuplicate = await findDuplicate({
				phone: parsedPhone.clear,
				ignorePhones: ignorePhones,
			});
			if (foundDuplicate.data?.length) {
				onError({ [index]: Const.FormPhone.Validate.FoundDuplicate });
				return false;
			}
		}

		// Если должен быть хотя-бы один телефон
		if (required && count < 1) {
			onError({ [0]: Const.FormPhone.Validate.IsRequired });
			return false;
		}

		return true;
	}, [required, values, isVoipSkip, data, findDuplicate, ignorePhones, onError]);
};
