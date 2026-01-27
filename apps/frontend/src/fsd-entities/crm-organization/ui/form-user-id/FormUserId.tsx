import { FC, useCallback, useMemo } from 'react';
import { IFormUserIdProps } from './form-user-id.types';
import { useValidate } from './useValidate';
import { CrmOrganizationConst } from '@fsd/entities/crm-organization';
import { StaffSelect } from '@fsd/entities/staff';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';

export const FormUserId: FC<IFormUserIdProps> = (props) => {
	const { value, error, required, onChange, onError, className } = props;
	const validate = useValidate(props);
	const team = useStateSelector((state) => state.staff.data.team);
	const sales = useStateSelector((state) => state.staff.data.sales);
	const isAdmin = useAccess({ access: CrmOrganizationConst.Access.Admin });
	const isSelfTeam = useMemo(() => !isAdmin && team.length === 1, [isAdmin, team.length]);

	const handleChange = useCallback(
		(value: string) => {
			if (error) {
				onError(undefined);
			}
			onChange(value);
		},
		[error, onChange, onError]
	);

	return (
		<StaffSelect
			label={'Ответственный'}
			value={[value ?? '']}
			onChange={(value) => handleChange(value[0])}
			onBlur={async () => {
				await validate();
			}}
			users={isAdmin ? sales : team}
			withOrphan={isAdmin}
			withPriority={isAdmin}
			error={error}
			className={className}
			required={required}
			disabled={isSelfTeam}
		/>
	);
};
