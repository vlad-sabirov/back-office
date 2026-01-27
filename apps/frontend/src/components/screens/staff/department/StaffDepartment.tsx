import { FC } from 'react';
import { StaffDepartmentAddModal, StaffDepartmentChangeToUserModal, StaffDepartmentDeleteModal } from './modals';
import { StaffDepartmentEditModal, StaffDepartmentListModal } from './modals';
import { observer } from 'mobx-react-lite';
import { useAccess } from '@hooks';

export const StaffDepartment: FC = observer(() => {
	const CheckAccess = useAccess();
	return (
		<>
			<StaffDepartmentListModal />

			{CheckAccess(['boss', 'developer', 'editUser']) && (
				<>
					<StaffDepartmentAddModal />
					<StaffDepartmentEditModal />
					<StaffDepartmentChangeToUserModal />
					<StaffDepartmentDeleteModal />
				</>
			)}
		</>
	);
});
