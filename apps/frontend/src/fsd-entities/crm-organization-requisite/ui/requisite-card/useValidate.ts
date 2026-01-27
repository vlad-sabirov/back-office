import { useCallback } from "react";
import { IRequisiteCardProps } from "./requisite-card.types";

export const useValidate = (props: IRequisiteCardProps) => {
	const { data, required } = props;

	return useCallback(() => {
		if (!required && !data.length) {
			return true;
		}

		if (required && !data.length) {
			// !!! Тут должна выводиться ошибка
		}

		return true;
	}, [data.length, required]);
};
