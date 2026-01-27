import { FC, useContext } from 'react';
import { MultiSelect } from '@fsd/shared/ui-kit';
import { TagsProps, FIELD_NAME_TAGS } from '.';
import { OrganizationContext } from '@screens/crm/organization/Organization.screen';
import { CrmOrganizationTagService } from '@services';
import { showNotification } from '@mantine/notifications';
import { observer } from 'mobx-react-lite';

export const Tags: FC<TagsProps> = observer(({ form, className }) => {
	const mainStore = useContext(OrganizationContext);

	const handleCreate = async (value: string) => {
		const [duplicate] = await CrmOrganizationTagService.findOnce({ where: { name: value } });
		if (duplicate) {
			await mainStore.getDataTagList();
			form.setFieldValue(FIELD_NAME_TAGS, [...form.values.tags, String(duplicate.id)]);
			return;
		}
		const [createdTag, err] = await CrmOrganizationTagService.create({ createDto: { name: value } });
		if (err) {
			showNotification({ color: 'red', message: err.message });
			return;
		}
		await mainStore.getDataTagList();
		if (!createdTag) return;
		form.setFieldValue(FIELD_NAME_TAGS, [...form.values.tags, String(createdTag.id)]);
	};

	return (
		<MultiSelect
			label={'Теги'}
			className={className}
			searchable
			creatable
			{...form.getInputProps(FIELD_NAME_TAGS)}
			data={mainStore.dataTagList.map(tag => ({
				label: tag.name,
				value: String(tag.id),
			}))}
			getCreateLabel={(query) => (
				<>Добавить тег <b>{query.trim().toLowerCase()}</b></>
			)}
			onFocus={() => mainStore.getDataTagList()}
			onCreate={handleCreate}
		/>
	);
});
