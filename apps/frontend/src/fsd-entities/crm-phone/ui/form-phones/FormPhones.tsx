import { FC, useCallback, useState } from "react";
import { useDebounce } from "@fsd/shared/lib/hooks";
import { Input, TextField } from "@fsd/shared/ui-kit";
import { IFormPhonesProps } from "./form-phones.types";
import { useValidate } from "./useValidate";
import css from "./form-phones.module.scss";
import { IPhoneFormEntity } from "../../entity";
import { trim } from "lodash";

export const FormPhones: FC<IFormPhonesProps> = (props) => {
	const { value: values, error: errors, onChange, onError, className, required } = props;
	const [val, setVal] = useState<IPhoneFormEntity[]>(values);
	const isValidate = useValidate(props);

	const handleAdd = useCallback(() => {
		setVal((oldVal) => [...oldVal, { value: '', comment: '' }]);
	}, [setVal]);

	const handleChangePhone = useCallback((
		{ index, value }: { index: number, value: string }
	) => {
		const newValues = [...val.map((item) => ({ ...item }))];
		newValues[index].value = value;
		setVal(newValues);
	}, [setVal, val]);

	const handleChangeComment = useCallback((
		{ index, value }: { index: number, value: string }
	) => {
		const newValues = [...val.map((item) => ({ ...item }))];
		newValues[index].comment = value;
		setVal(newValues);
	}, [setVal, val]);

	const handleChangeState = useDebounce(() => {
		if (!onError || !onChange) { return; }
		if (errors) { onError(undefined); }
		onChange(val.map((item) => ({ value: trim(item.value), comment: trim(item.comment) })));
	}, 100);

	return (
		<div className={className}>
			<div className={css.label}>
				<TextField
					size={'small'}
					className={css.title}
				> Телефон{val.length > 1 && 'ы'} {required && <span>*</span>} </TextField>

				<TextField 
					size={'small'} 
					className={css.add}
					onClick={handleAdd}
				> Добавить </TextField>
			</div>

			<div className={css.forms}>
				{val.map((value, index) => {
					return <div className={css.formItem} key={index}>
						<Input
							mode={'phone'}
							value={value.value}
							onChange={(value) => {
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								handleChangePhone({ value: value as any, index });
								handleChangeState();
							}}
							onBlur={async () => await isValidate()}
							error={errors?.[index]}
						/>
						<Input
							value={value.comment}
							placeholder={'Комментарий...'}
							onChange={(e) => {
								handleChangeComment({ value: e.currentTarget.value, index });
								handleChangeState();
							}}
						/>
					</div>;
				})}
			</div>
		</div>
	);
}
