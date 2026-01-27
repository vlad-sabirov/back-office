import { FC } from 'react';
import { Input } from '@fsd/shared/ui-kit';
import { workPositionValidate, WORK_POSITION_CONSTANTS } from '.';
import * as Types from './work-position.types';

export const WorkPosition: FC<Types.WorkPositionT> = ({ form, className }) => {
	return (
		<Input
			label={'Должность'}
			{...form.getInputProps(WORK_POSITION_CONSTANTS.FIELD_NAME)}
			onBlur={() => workPositionValidate({ form })}
			className={className}
			required
		/>
	);
};
