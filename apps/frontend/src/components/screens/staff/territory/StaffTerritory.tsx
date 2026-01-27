import { StaffTerritoryAddModal, StaffTerritoryChangeToUserModal, StaffTerritoryDeleteModal } from './modals';
import { StaffTerritoryEditModal, StaffTerritoryListModal } from './modals';
import { observer } from 'mobx-react-lite';
import { useAccess } from '@hooks';

export const StaffTerritory = observer((): JSX.Element => {
	const CheckAccess = useAccess();

	return (
		<>
			<StaffTerritoryListModal />

			{CheckAccess(['boss', 'developer', 'editUser']) && (
				<>
					<StaffTerritoryAddModal />
					<StaffTerritoryEditModal />
					<StaffTerritoryDeleteModal />
					<StaffTerritoryChangeToUserModal />
				</>
			)}
		</>
	);
});
