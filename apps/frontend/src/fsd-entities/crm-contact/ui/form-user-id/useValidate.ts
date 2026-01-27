import { useCallback } from 'react';
import { IFormUserIdProps } from './form-user-id.types';
import { Const } from '../../config/const';

export const useValidate = (props: IFormUserIdProps) => {
	const { value, required, onError } = props;

	return useCallback(async (): Promise<boolean> => {
		onError(undefined);

		if (!value?.length && required) {
			onError(Const.Form.UserId.IsRequired);
			return false;
		}

		return true;
	}, [value, required, onError]);
};
