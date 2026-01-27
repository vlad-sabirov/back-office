import { useState } from 'react';
import cn from 'classnames';
import { DropzoneProps, TextField } from '@fsd/shared/ui-kit';
import { Dropzone as MantineDropzone } from '@mantine/dropzone';
import css from './Dropzone.module.scss';

export const Dropzone = ({
	label,
	defaultStatus,
	acceptStatus,
	rejectStatus,
	required,
	disabled,
	className,
	error,
	onDrop,
	...props
}: DropzoneProps): JSX.Element => {
	const [value, setValue] = useState<boolean>(false);
	const [isAccept, setAccept] = useState<boolean>(false);

	const classNamesDropzone = cn(css.wrapper, className, { [css.disabled]: disabled });
	const classNamesRoot = cn({
		[css.root]: true,
		[css.stateError]: error,
		[css.fileSelected]: value,
	});

	return (
		<div className={classNamesRoot}>
			{label && label.length > 0 ? (
				<TextField size="small" className={css.label}>
					{label}
					{required ? <span>*</span> : null}
				</TextField>
			) : null}

			<MantineDropzone
				{...props}
				onDrop={(files) => {
					onDrop(files);
					setAccept(true);
					setValue(true);
				}}
				className={classNamesDropzone}
			>
				<MantineDropzone.Accept>
					<div className={css.children}>{acceptStatus}</div>
				</MantineDropzone.Accept>
				<MantineDropzone.Reject>
					<div className={css.children}>{rejectStatus}</div>
				</MantineDropzone.Reject>
				<MantineDropzone.Idle>
					<TextField className={css.children} size="small">
						{isAccept ? 'Файл загружен!' : defaultStatus}
					</TextField>
				</MantineDropzone.Idle>
			</MantineDropzone>

			{error?.length ? (
				<TextField size="small" className={css.error}>
					{error}
				</TextField>
			) : null}
		</div>
	);
};
