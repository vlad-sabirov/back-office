import { FC, useCallback, useState } from "react";
import { trim } from "lodash";
import { useDebounce } from "@fsd/shared/lib/hooks";
import { Input, TextField } from "@fsd/shared/ui-kit";
import { IEmailFormEntity } from "../../entity";
import { IFormEmailsProps } from "./form-emails.types";
import { useValidate } from "./useValidate";
import css from "./form-emails.module.scss";

export const FormEmails: FC<IFormEmailsProps> = (props) => {
	const { value: values, error: errors, required, changeField, onChange } = props;
	const [val, setVal] = useState<IEmailFormEntity[]>(values);
	const isValidate = useValidate(props);

	const handleAdd = useCallback(() => {
		setVal((oldVal) => [...oldVal, { value: '', comment: '' }]);
	}, [setVal]);

	const handleChangeEmail = useCallback((
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
		if (!changeField || !onChange) { return; }
		onChange({
			field: changeField, 
			value: val.map((item) => ({ value: trim(item.value), comment: trim(item.comment) })),
			error: undefined
		});
	}, 100);

	return (
		<div>
			<div className={css.label}>
				<TextField
					size={'small'}
					className={css.title}
				>
					{val.length > 1 ? 'Почтовые ящики' : 'Почтовый ящик'}
					{required && <span> *</span>} </TextField>
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
							mode={'email'}
							value={value.value}
							onChange={(value) => {
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								handleChangeEmail({ value: value as any, index });
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
