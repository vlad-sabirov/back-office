import { FC } from 'react';
import { IStaffProfileProps } from './staff-profile.types';
import cn from 'classnames';
import { useRouter } from 'next/router';
import { ContentBlock } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { Basic } from '../basic/Basic';
import { Contacts } from '../contacts/Contacts';
import { System } from '../system/System';
import { Team } from '../team/Team';
import css from './staff-profile.module.scss';

export const StaffProfile: FC<IStaffProfileProps> = (args) => {
	const { className } = args;
	const { query } = useRouter();
	const { user } = useUserDeprecated(query.id ? Number(query.id) : undefined);

	if (!user) {
		return null;
	}

	return (
		<ContentBlock className={cn(className, css.root)}>
			<Basic user={user} />
			<Contacts user={user} />
			<Team user={user} />
			<System user={user} />
		</ContentBlock>
	);
};
