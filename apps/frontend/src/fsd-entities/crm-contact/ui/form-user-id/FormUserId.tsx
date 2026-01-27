import { FC, useEffect, useMemo, useState } from 'react';
import { IFormUserIdProps } from './form-user-id.types';
import { useValidate } from './useValidate';
import { StaffSelect } from '@fsd/entities/staff';
import { useAccess, useDebounce, useStateSelector } from '@fsd/shared/lib/hooks';
import { CrmContactConst } from '../..';

export const FormUserId: FC<IFormUserIdProps> = (props) => {
	const { value, error, users, required, onChange, onError } = props;
	const validate = useValidate(props);
	const team = useStateSelector((state) => state.staff.data.team);
	const isAdmin = useAccess({ access: CrmContactConst.Access.Admin });
	const isSelfTeam = useMemo(() => !isAdmin && team.length === 1, [isAdmin, team.length]);

	const [val, setVal] = useState<string>('');

	useEffect(() => setVal(value), [value]);

	const handleChangeState = useDebounce(async (value: string) => {
		if (!onChange) {
			return;
		}
		onChange(value || '');
	}, 100);

	return (
		<StaffSelect
			label={'Ответственный'}
			value={[val]}
			onChange={(value) => {
				setVal(value[0]);
				handleChangeState(value[0]);
				onError(undefined);
			}}
			onBlur={validate}
			onAbort={validate}
			onSelect={validate}
			users={isAdmin ? users : team}
			withOrphan={isAdmin}
			error={error}
			required={required}
			disabled={isSelfTeam}
		/>
	);
};
