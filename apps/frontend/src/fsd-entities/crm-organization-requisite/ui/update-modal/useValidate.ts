import { useCallback } from 'react';
import { IUpdateModalChangeError } from './update-modal.types';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { useActions } from '../../lib/use-actions';
import { IRequisiteSliceFormEntity } from '../../model/slice/requisite-slice.types';
import { useValidate as useValidateCode1c } from '../form-code-1c/useValidate';
import { useValidate as useValidateInn } from '../form-inn/useValidate';
import { useValidate as useValidateName } from '../form-name/useValidate';

export const useValidate = (data: IRequisiteSliceFormEntity[]) => {
	const actions = useActions();
	const current = useStateSelector((state) => state.crm_organization_requisite.current);

	const handleChangeError = useCallback(
		([field, value]: IUpdateModalChangeError) => {
			actions.setErrorCreate({ [field]: value });
		},
		[actions]
	);

	const nameVal = useStateSelector((state) => state.crm_organization_requisite.form.update.name);
	const nameErr = useStateSelector((state) => state.crm_organization_requisite.error.update.name);
	const innVal = useStateSelector((state) => state.crm_organization_requisite.form.update.inn);
	const innErr = useStateSelector((state) => state.crm_organization_requisite.error.update.inn);
	const code1cVal = useStateSelector((state) => state.crm_organization_requisite.form.update.code1c);
	const code1cErr = useStateSelector((state) => state.crm_organization_requisite.error.update.code1c);

	const nameValidate = useValidateName({
		data,
		ignoreData: data.filter((item) => item.id === current?.id),
		value: nameVal,
		error: nameErr,
		onChange: () => null,
		onError: (value) => handleChangeError(['name', value]),
		required: true,
	});

	const code1cValidate = useValidateCode1c({
		data,
		ignoreData: data.filter((item) => item.id === current?.id),
		value: code1cVal,
		error: code1cErr,
		onChange: () => null,
		onError: (value) => handleChangeError(['code1c', value]),
		required: true,
	});

	const innValidate = useValidateInn({
		data,
		ignoreData: data.filter((item) => item.id === current?.id),
		value: innVal ?? '',
		error: innErr,
		onChange: () => null,
		onError: (value) => handleChangeError(['inn', value]),
	});

	return async () => {
		if (!(await nameValidate())) {
			return false;
		} else if (!(await code1cValidate())) {
			return false;
		} else if (!(await innValidate())) {
			return false;
		}
		return true;
	};
};
