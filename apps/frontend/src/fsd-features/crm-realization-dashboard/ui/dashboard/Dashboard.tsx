import { FC } from 'react';
import { CRM_REALIZATION_ACCESS, useCrmRealizationGetDataMonthAll } from '@fsd/entities/crm-realization';
import { useAccess } from '@fsd/shared/lib/hooks';
import { useUserDeprecated } from '@hooks';
import { Boss } from '../boss/Boss';
import { ManyChild } from '../many-child/ManyChild';
import { ManyParent } from '../many-parent/ManyParent';
import { Once } from '../once/Once';

export const Dashboard: FC = () => {
	const isAccess = useAccess({ access: CRM_REALIZATION_ACCESS.DISPLAY_REALIZATION });
	const isAdmin = useAccess({ access: CRM_REALIZATION_ACCESS.DISPLAY_ALL_REALIZATION });
	const { userId, parent, team } = useUserDeprecated();
	const reportAll = useCrmRealizationGetDataMonthAll();

	if (isAdmin) {
		return <Boss />;
	}

	if (
		isAccess &&
		(team?.length === 1 ||
			!reportAll?.last?.downToTeams?.linkedList?.[parent ?? userId ?? 0]?.data?.employees?.length)
	) {
		return <Once />;
	}

	if (isAccess && team?.length && team.length > 1 && parent) {
		return <ManyChild />;
	}

	if (isAccess && team?.length && team.length > 1 && !parent) {
		return <ManyParent />;
	}

	return null;
};
