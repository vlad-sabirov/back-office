import { FC } from 'react';
import { Input } from '@fsd/shared/ui-kit';
import { FIELD_NAME_FIRST_DOCUMENT, FirstDocumentProps, firstDocumentValidate } from '.';

export const FirstDocument: FC<FirstDocumentProps> = ({ form, className }) => {
	return (
		<Input
			label={'Расходная накладная'}
			{...form.getInputProps(FIELD_NAME_FIRST_DOCUMENT)}
			onBlur={() => firstDocumentValidate({ form })}
			className={className}
			required
		/>
	);
};
