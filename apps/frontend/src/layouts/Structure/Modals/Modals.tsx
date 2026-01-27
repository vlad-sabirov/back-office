import { StaffDepartment, StaffTerritory, StaffUserRegistrationModal } from '@screens/staff';

export const ModalsLayout = (): JSX.Element => {
	return (
		<>
			<StaffDepartment />
			<StaffTerritory />
			<StaffUserRegistrationModal />
		</>
	);
};
