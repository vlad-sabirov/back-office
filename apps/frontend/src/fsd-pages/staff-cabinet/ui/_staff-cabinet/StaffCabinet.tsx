import { FC, useContext, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import { HeaderContent } from '@components/HeaderContent/HeaderContent';
import { useStateSelector, useUser } from '@fsd/shared/lib/hooks';
import { StaffProfileWidget } from '@fsd/widgets/staff-profile';
import { StaffRealizationWidget } from '@fsd/widgets/staff-realization';
import { StaffWorkingBaseWidget, StaffTasksWidget, StaffNotesWidget, StaffMeetingsWidget, StaffOrganizedMeetingsWidget } from '@fsd/widgets/staff-working-base';
import { MainContext } from '@globalStore';
import { Grid } from '@mantine/core';
import {
	StaffChangePasswordModal,
	StaffUserDeleteModal,
	StaffUserEditModal,
	StaffUserFiredModal,
	StaffUserHireModal,
} from '@screens/staff';
import { EditContactInfoModal, EditPersonalInfoModal } from '@screens/staff/cabinet/modals';
import { RightSection } from '../right-section';
import css from './staff-cabinet.module.scss';

const StaffCabinet: FC = observer(() => {
	const { staffStore } = useContext(MainContext);
	const { query } = useRouter();
	const { user } = useUser(query.id ? Number(query.id) : undefined);
	const userId = useStateSelector((state) => state.app.auth.userId);

	useEffect(() => {
		if (query.id) staffStore.setCurrentUserById(query.id as string).then();
	}, [query.id, staffStore]);

	return (
		<>
			<HeaderContent title={'Профиль пользователя'} rightSection={<RightSection />} />
			<div className={css.root}>
				<StaffProfileWidget className={css.left} />

				<Grid gutter={20} columns={100} className={css.right} grow align={'flex-start'}>
					<StaffRealizationWidget />
					<StaffWorkingBaseWidget />
					<StaffTasksWidget />
					<StaffMeetingsWidget />
					<StaffOrganizedMeetingsWidget />
					<StaffNotesWidget />
				</Grid>
			</div>

			{user?.id === Number(userId) && (
				<>
					<EditPersonalInfoModal user={user} />
					<EditContactInfoModal user={user} />
				</>
			)}

			<StaffUserEditModal />
			<StaffChangePasswordModal />
			<StaffUserDeleteModal />
			<StaffUserFiredModal />
			<StaffUserHireModal />
		</>
	);
});

export default StaffCabinet;
