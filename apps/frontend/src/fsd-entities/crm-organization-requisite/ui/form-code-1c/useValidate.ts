import { useCallback } from 'react';
import { IFormCode1cProps } from './form-code-1c.types';
import { CrmOrganizationRequisiteService } from '@fsd/entities/crm-organization-requisite';
import { Const } from '../../config/const';

export const useValidate = (props: IFormCode1cProps) => {
	const { value, required, data, ignoreData, onError } = props;
	const [findOnce] = CrmOrganizationRequisiteService.findOnce();

	return useCallback(async (): Promise<boolean> => {
		if (!required && (!value || !value.length)) {
			return true;
		}

		if (required && (!value || !value.length)) {
			onError(Const.Form.Code1C.IsRequired);
			return false;
		}

		if (ignoreData && ignoreData?.some((item) => item.code1c === value.trim())) {
			return true;
		}

		if (data?.some((item) => item.code1c === value.trim())) {
			onError(Const.Form.Code1C.FoundDuplicate);
			return false;
		}

		const findDuplicate = await findOnce({ where: { code1c: value.trim() } });
		if ('data' in findDuplicate && findDuplicate.data) {
			onError(Const.Form.Code1C.FoundDuplicate);
			return false;
		}

		return true;
	}, [required, value, ignoreData, data, findOnce, onError]);
};
