import { FC, ReactNode, useState } from 'react';
import { CrmCardTypes, useCrmCardShowDrawer } from '@fsd/entities/crm-card';
import { ICrmOrganizationEntity } from '@fsd/entities/crm-organization';
import { TextField, TextFiendPropsSize } from '@fsd/shared/ui-kit';
import { Popover } from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';
import css from './table-transform-organizations.module.scss';

interface IExec {
	organizations: ICrmOrganizationEntity[] | null;
	size?: (typeof TextFiendPropsSize)[number];
}
type IResponse = (props: IExec) => { output: ReactNode; index: string };

export const useTableTransformOrganizations = (): IResponse => {
	const showDrawer = useCrmCardShowDrawer();

	const handleCardOpen = (id: number) => {
		showDrawer({ id, type: CrmCardTypes.Organization });
	};

	return ({ organizations, size }: IExec) => {
		if (!organizations || !organizations.length) {
			return { output: null, index: '' };
		}

		let output = <PopoverOrganizations organizations={organizations} handleCardOpen={handleCardOpen} size={size} />;

		if (organizations.length === 1) {
			output = (
				<TextField className={css.once} size={size} onClick={() => handleCardOpen(organizations[0].id)}>
					{' '}
					{organizations[0].nameEn}{' '}
				</TextField>
			);
		}

		return { output, index: '' };
	};
};

interface IPopoverOrganizationsProps {
	organizations: ICrmOrganizationEntity[] | null;
	size?: (typeof TextFiendPropsSize)[number];
	handleCardOpen: (id: number) => void;
}
const PopoverOrganizations: FC<IPopoverOrganizationsProps> = ({ organizations, handleCardOpen, size }) => {
	const [opened, setOpened] = useState<boolean>(false);
	const ref = useClickOutside(() => setOpened(false));

	const handleClick = (id: number) => {
		handleCardOpen(id);
		setOpened(false);
	};

	if (!organizations) {
		return null;
	}
	return (
		<>
			<Popover
				radius={'md'}
				offset={-4}
				shadow={'xl'}
				position={'top-start'}
				withArrow
				opened={opened}
				onChange={setOpened}
			>
				<Popover.Target>
					<div>
						<TextField size={size} className={css.many}>
							{organizations[0].nameEn}...
						</TextField>
					</div>
				</Popover.Target>
				<Popover.Dropdown>
					<div className={css.manyWrapper} ref={ref}>
						{organizations.map((organization) => (
							<div key={organization.id} onClick={() => handleClick(organization.id)}>
								<TextField className={css.manyName}>{organization.nameEn}</TextField>
							</div>
						))}
					</div>
				</Popover.Dropdown>
			</Popover>
		</>
	);
};
