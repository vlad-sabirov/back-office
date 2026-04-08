import { useCallback, useMemo } from 'react';
import { CrmOrganizationConst, ICrmOrganizationEntity } from '@fsd/entities/crm-organization';
import {
	useTableTransformCrmContacts,
	useTableTransformCrmOrganization,
	useTableTransformCrmPhones,
} from '@fsd/features/crm-table-transform';
import { useUser } from '@fsd/shared/lib/hooks';
import { TablePropsData } from '@fsd/shared/ui-kit';
import { useTableTransformText, useTableTransformUser } from '@fsd/shared/ui/table-transform';
import { IDateToTableProps } from '../types/data-to-table.props';
import { createElement } from 'react';
import { QuickActions } from '../ui/quick-actions/QuickActions';

const resultNull = { output: null, index: '' };

export const useDataToTable = (data: IDateToTableProps): TablePropsData | null => {
	const { getTeam, getRoles } = useUser();
	const rolesAlias = useMemo(() => getRoles(), [getRoles]);
	const team = useMemo(() => getTeam(), [getTeam]);
	const organization = useTableTransformCrmOrganization();
	const user = useTableTransformUser();
	const type = useTableTransformText();
	const contacts = useTableTransformCrmContacts();
	const phones = useTableTransformCrmPhones();

	const isAccess = useCallback(
		(data: ICrmOrganizationEntity) => {
			const isAdmin = rolesAlias?.some((role) => CrmOrganizationConst.Access.Admin.includes(role));
			const isNotMy = data.userId && !team?.includes(data.userId);
			return isAdmin || !isNotMy;
		},
		[rolesAlias, team]
	);

	if (!data || !data.length) return null;
	return {
		header: [
			{ key: 'name', label: 'Компания', width: 370 },
			{ key: 'user', label: 'Ответственный', width: 140 },
			{ key: 'type', label: 'Сфера деятельности', width: 140 },
			{ key: 'contacts', label: 'Контакты', width: 140 },
			{ key: 'phones', label: 'Телефоны', width: 140 },
			{ key: 'actions', label: '', width: 100 },
		],
		sortKeys: ['name', 'user', 'type'],
		sortDefault: 'asc',
		body: data.map((organizationItem) => {
			return {
				tr_settings: {
					color: team?.includes(organizationItem.userId ?? 0)
						? (organizationItem.color as undefined)
						: undefined,
				},
				name: organization({ organization: organizationItem }),
				user: user({ user: organizationItem.user, isArchive: organizationItem.isArchive }),
				type: type({
					value: organizationItem.type?.name || 'другое',
					transform: 'capitalize',
				}),
				contacts: isAccess(organizationItem)
					? contacts({ contacts: organizationItem.contacts || null })
					: resultNull,
				phones: isAccess(organizationItem)
					? phones({
							phones: organizationItem.phones || null,
							name: `${organizationItem.nameEn} (${organizationItem.nameRu})`,
					  })
					: resultNull,
				actions: {
					output: createElement(QuickActions, { organization: organizationItem }),
					index: '',
				},
			};
		}),
	};
};
