import { FC, memo, useCallback } from "react";
import { Input } from "@fsd/shared/ui-kit";
import { IFormWebsiteProps } from "./form-website.types";
import { useValidate } from "./useValidate";

export const FormWebsite: FC<IFormWebsiteProps> = memo((props) => {
	const { value, error, required, onChange, onError, className } = props;
	const validate = useValidate(props);

	const handleChange = useCallback((value: string) => {
		if (error) { onError(undefined); }
		onChange(value);
	}, [error, onChange, onError]);

	return (
		<Input
			label={'Вебсайт'}
			value={value}
			onChange={(e) => handleChange(e.currentTarget.value)}
			onBlur={async () => { await validate(); }}
			className={className}
			error={error}
			required={required}
		/>
	);
});
FormWebsite.displayName = "FormWebsite";
