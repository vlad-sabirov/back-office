import { FC, useCallback, useState } from "react";
import { IFromTagsProps } from "./form-tags.types";
import { MultiSelect } from "@fsd/shared/ui-kit";
import { useStateSelector } from "@fsd/shared/lib/hooks";
import { TagService } from "../../model/service/tag.service";
import { useValidate } from "./useValidate";

export const FormTags: FC<IFromTagsProps> = (props) => {
	const {
		label,
		searchable,
		creatable,
		value,
		error,
		onChange,
		onError,
		className,
		required,
	} = props;
	const [val, setVal] = useState<string[]>(value ?? []);
	const tags = useStateSelector((state) => state.crm_organization_tag.data.list);
	const [getList] = TagService.getList();
	const [getDuplicate] = TagService.getOnce();
	const [create] = TagService.create();
	const validate = useValidate(props);

	const handleCreateTag = useCallback(async (value: string) => {
		const duplicate = await getDuplicate({ where: { name: value } });
		if (duplicate.data) {
			await getList();
			setVal((old) => [...old, String(duplicate)]);
			return;
		}
		const createdTag = await create({ name: value });
		if ('error' in createdTag) {
			onError('Неизвестная ошибка. Обратитесь за помощью в IT отдел');
		}
		await getList();
		if (!('data' in createdTag)) { return; }
		setVal((old) => [...old, String(createdTag.data.id)]);
	}, [create, getDuplicate, getList, onError]);

	return (
		<>
			<MultiSelect
				label={label ?? 'Теги'}
				value={val}
				onChange={(val) => {
					setVal(val);
					onChange(val);
				}}
				data={tags.map((tag) => ({ label: tag.name, value: String(tag.id), }))}
				required={required}
				searchable={searchable ?? true}
				creatable={creatable ?? true}
				getCreateLabel={(query) => (
					<>Добавить тег <b>{query.trim().toLowerCase()}</b></>
				)}
				onBlur={validate}
				onCreate={(val) => {
					handleCreateTag(val).then();
					return val;
				}}
				className={className}
				error={error}
			/>
		</>
	);
}
