import { useCallback } from 'react';
import { CrmContactConst, ICrmContactEntity } from '@fsd/entities/crm-contact';
import {
	useTableTransformCrmContact,
	useTableTransformCrmOrganizations,
	useTableTransformCrmPhones,
} from '@fsd/features/crm-table-transform';
import { TablePropsData } from '@fsd/shared/ui-kit';
import { useTableTransformText, useTableTransformUser } from '@fsd/shared/ui/table-transform';
import { useUserDeprecated } from '@hooks';
import { IDateToTableProps } from '../types/data-to-table.props';

const resultNull = { output: null, index: '' };

export const useDataToTable = (data: IDateToTableProps): TablePropsData | null => {
	const { team, rolesAlias } = useUserDeprecated();
	const contact = useTableTransformCrmContact();
	const user = useTableTransformUser();
	const workPosition = useTableTransformText();
	const organizations = useTableTransformCrmOrganizations();
	const phones = useTableTransformCrmPhones();

	const isAccess = useCallback(
		(data: ICrmContactEntity) => {
			const isAdmin = rolesAlias?.some((role) => CrmContactConst.Access.Admin.includes(role));
			const isNotMy = data.userId && !team?.includes(data.userId);
			return isAdmin || !isNotMy;
		},
		[rolesAlias, team]
	);

	if (!data || !data.length) return null;
	return {
		header: [
			{ key: 'name', label: 'Имя', width: 400 },
			{ key: 'user', label: 'Ответственный', width: 150 },
			{ key: 'workPosition', label: 'Должность', width: 150 },
			{ key: 'organizations', label: 'Организации', width: 150 },
			{ key: 'phones', label: 'Телефоны', width: 150 },
		],
		sortKeys: ['name', 'user', 'type'],
		sortDefault: 'asc',
		body: data.map((contactItem) => {
			return {
				name: contact({ contact: contactItem }),
				user: user({ user: contactItem.user, isArchive: contactItem.isArchive }),
				workPosition: workPosition({ value: contactItem.workPosition }),
				organizations: isAccess(contactItem)
					? organizations({ organizations: contactItem.organizations || null })
					: resultNull,
				phones: isAccess(contactItem)
					? phones({ phones: contactItem.phones || null, name: contactItem.name })
					: resultNull,
			};
		}),
	};
};
