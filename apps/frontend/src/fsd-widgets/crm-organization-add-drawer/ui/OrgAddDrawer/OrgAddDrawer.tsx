import { memo, useCallback, useEffect } from 'react';
import { CrmOrganizationConst } from '@fsd/entities/crm-organization';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { Drawer } from '@fsd/shared/ui-kit';
import { OrgAddButtons } from '@fsd/widgets/crm-organization-add-drawer/ui/OrgAddButtons/OrgAddButtons';
import { useUserDeprecated } from '@hooks';
import { useCreate } from '../../lib/use-create/use-create';
import { useValidate } from '../../lib/use-validate/use-validate';
import { useActions } from '../../lib/useActions/useActions';
import { OrgAddForm } from '../OrgAddForm/OrgAddForm';

export const OrgAddDrawer = memo(() => {
	const isShow = useStateSelector((state) => state.crm_organization_add_drawer.isShow);
	const isLoading = useStateSelector((state) => state.crm_organization_add_drawer.isLoading);
	const errors = useStateSelector((state) => state.crm_organization_add_drawer.errors);
	const { userId } = useUserDeprecated();
	const isAdmin = useAccess({ access: CrmOrganizationConst.Access.Admin });
	const actions = useActions();
	const validate = useValidate();
	const create = useCreate();

	const handleCloseModal = useCallback(() => {
		actions.setIsShow(false);
		actions.setIsLoading(false);
		actions.setErrors(Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: undefined }), {}));
	}, [actions, errors]);

	const handleSave = useCallback(async () => {
		actions.setIsLoading(true);
		if (!(await validate())) {
			actions.setIsLoading(false);
			return;
		}
		if (!(await create())) {
			actions.setIsLoading(false);
			return;
		}
		actions.clear();
		handleCloseModal();
		actions.setIsLoading(false);
		// actions.setValues(initialState.values);
	}, [actions, create, handleCloseModal, validate]);

	useEffect(() => {
		if (!isShow || isAdmin) {
			return;
		}
		actions.setValues({ userId: userId ?? 0 });
	}, [actions, isAdmin, isShow, userId]);

	return (
		<Drawer
			title={'Добавление организации'}
			opened={isShow}
			onClose={handleCloseModal}
			position={'left'}
			width={480}
			loading={isLoading}
		>
			<OrgAddForm />

			<OrgAddButtons onSave={handleSave} onClose={handleCloseModal} />
		</Drawer>
	);
});
OrgAddDrawer.displayName = 'OrgAddDrawer';
