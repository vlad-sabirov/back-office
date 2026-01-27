import { FC, memo, useCallback, useMemo } from "react";
import { capitalize } from "lodash";
import { SelectItem } from "@mantine/core/lib/Select/types";
import { useStateSelector } from "@fsd/shared/lib/hooks";
import { Select } from "@fsd/shared/ui-kit";
import { IFormTypeProps } from "./form-type.types";
import { useValidate } from "./useValidate";

export const FormType: FC<IFormTypeProps> = memo((props) => {
	const { value, error, required, onChange, onError, className } = props;
	const types = useStateSelector((state) => state.crm_organization_type.data.list);
	const validate = useValidate(props);
	const data: SelectItem[] = useMemo(() => types.map((type) => ({
		label: capitalize(type.name),
		value: String(type.id),
	})), [types]);

	const handleChange = useCallback((value: string) => {
		if (error) { onError(undefined); }
		onChange(value);
	}, [error, onChange, onError]);

	return (
		<Select
			label={'Сфера деятельности'}
			data={data}
			value={value}
			onChange={(value) => handleChange(value ?? '')}
			onBlur={async () => { await validate(); }}
			className={className}
			error={error}
			required={required}
			searchable
		/>
	);
});
FormType.displayName = 'FormType';
