import { useCallback } from 'react';
import { IFormInnProps } from './form-inn.types';
import { CrmOrganizationRequisiteService } from '@fsd/entities/crm-organization-requisite';
import { Const } from '../../config/const';

export const useValidate = (props: IFormInnProps) => {
	const { value, required, data, ignoreData, onError } = props;
	const [findOnce] = CrmOrganizationRequisiteService.findOnce();

	return useCallback(async (): Promise<boolean> => {
		if (!required && !value.length) {
			return true;
		}

		if (required && !value.length) {
			onError(Const.Form.Inn.IsRequired);
			return false;
		}

		if (!required && value.length !== Const.Form.Inn.WrongFormat.Count) {
			onError(Const.Form.Inn.WrongFormat.Message);
			return false;
		}

		if (ignoreData && ignoreData?.some((item) => item.inn === value.trim())) {
			return true;
		}

		if (data?.some((item) => item.inn === value.trim())) {
			onError(Const.Form.Inn.FoundDuplicate);
			return false;
		}

		const findDuplicate = await findOnce({ where: { inn: value.trim() } });
		if ('data' in findDuplicate && findDuplicate.data) {
			onError(Const.Form.Inn.FoundDuplicate);
			return false;
		}

		return true;
	}, [required, value, ignoreData, data, findOnce, onError]);
};
