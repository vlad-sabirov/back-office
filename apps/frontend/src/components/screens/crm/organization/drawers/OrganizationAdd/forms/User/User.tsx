import TailwindColors from '@config/tailwind/color';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { MultiSelectUser } from '@fsd/shared/ui-kit';
import { FC } from 'react';
import { UserProps, userValidate, FIELD_NAME_USER } from '.';

export const User: FC<UserProps> = ({ form, className }) => {
	const sales = useStateSelector((state) => state.staff.data.sales);
	
	return (
		<MultiSelectUser
			label={'Ответственный'}
			{...form.getInputProps(FIELD_NAME_USER)}
			value={[form.values.organization.userId]}
			onChange={(value) => form.setFieldValue(FIELD_NAME_USER, value[0])}
			data={[
				{
					id: 0,
					lastName: 'Общий',
					firstName: 'котел',
					color: TailwindColors.primary.main,
					photo: '/system/back-office.jpg'
				},
				...sales
			]}
			onBlur={() => userValidate({ form })}
			className={className}
			required
		/>
	);
};
