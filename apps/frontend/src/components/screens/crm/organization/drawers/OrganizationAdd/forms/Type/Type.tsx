import { FC } from 'react';
import { Select } from '@fsd/shared/ui-kit';
import { TypeProps, typeValidate, FIELD_NAME_TYPE } from '.';
import { observer } from 'mobx-react-lite';
import { capitalize } from 'lodash';
import { useStateSelector } from '@fsd/shared/lib/hooks';

export const Type: FC<TypeProps> = observer(({ form, className }) => {
	const dataTypes = useStateSelector((state) => state.crm_organization_type.data.list);

	return (
		<Select
			label={'Сфера деятельности'}
			{...form.getInputProps(FIELD_NAME_TYPE)}
			data={[
				{
					label: 'Другое',
					value: '0',
				},
				...dataTypes.map((item) => ({
					label: capitalize(item.name),
					value: String(item.id),
				}))
			]}
			onBlur={() => typeValidate({ form })}
			className={className}
			required
		/>
	);
});
