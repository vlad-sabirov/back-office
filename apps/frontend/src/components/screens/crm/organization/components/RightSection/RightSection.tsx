import { FC, useContext, useState } from 'react';
import { RightSectionProps } from './index';
import { Button, Icon, Menu } from '@fsd/shared/ui-kit';
import { OrganizationContext } from '@screens/crm';
import { OrganizationTagList, OrganizationTypeList } from '@screens/crm/organization/modals';
import { OrganizationAddDrawer } from '../../drawers';
import css from './right-section.module.scss';
import { observer } from 'mobx-react-lite';

export const RightSection: FC<RightSectionProps> = observer(({ ...props }) => {
	const Store = useContext(OrganizationContext);
	const [isOpenedType, setIsOpenedType] = useState<boolean>(false);
	const [isOpenedTag, setIsOpenedTag] = useState<boolean>(false);

	return (
		<>
			<div className={css.wrapper} {...props}>
				<Button
					iconLeft={<Icon name={'plus-medium'} style={{ width: 12 }} />}
					color={'info'}
					onClick={() => Store.setDrawerOrganizationAdd(true)}
				>
					Компания
				</Button>

				<Menu
					withArrow
					offset={-8}
					control={
						<Button color={'primary'} iconLeft={<Icon name={'settings'} />}>
							Настройки
						</Button>
					}
				>
					<Menu.Item onClick={() => setIsOpenedType(true)}>Виды деятельности</Menu.Item>
					<Menu.Item onClick={() => setIsOpenedTag(true)}>Теги</Menu.Item>
				</Menu>
			</div>

			<OrganizationAddDrawer />

			<OrganizationTagList isOpen={isOpenedTag} setOpen={setIsOpenedTag} />
			<OrganizationTypeList isOpen={isOpenedType} setOpen={setIsOpenedType} />
		</>
	);
});
