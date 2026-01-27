import { FC, useEffect, useRef, useState } from "react";
import { format, parse } from "date-fns";
import { DatePicker } from "@fsd/shared/ui-kit";
import { IFormBirthdayProps } from "./form-birthday.types";
import { useValidate } from "./useValidate";

export const FormBirthday: FC<IFormBirthdayProps> = (props) => {
	const { value, error, required, onChange, onError, className } = props;
	const [val, setVal] = useState<string>(value);
	const validate = useValidate(props);
	const firstRender = useRef<boolean>(true);

	const handleChangeState = (value: string) => {
		if (!onChange) { return; }
		if (error) { onError(undefined); }
		onChange(value);
	};
	
	useEffect(() => {
		if (firstRender.current) {
			firstRender.current = false;
			return;
		}
		validate().then();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value, firstRender])

	return (
		<DatePicker
			label={'День рождения'}
			value={val ? parse(val, 'yyyy-MM-dd', new Date()) : null}
			onChange={async (date) => {
				const value = date ? format(date, 'yyyy-MM-dd') : '';
				handleChangeState(value);
				setVal(value);
			}}
			error={error}
			className={className}
			required={required}
		/>
	);
}
