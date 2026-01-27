import cn from 'classnames';
import TailwindColors from '@config/tailwind/color';
import { Loader, Modal as MantineModal } from '@mantine/core';
import { TextField } from '@fsd/shared/ui-kit';
import { ModalButtonProps, ModalProps } from './Modal.props';
import css from './Styles.module.scss';

const Modal = ({
	opened,
	onClose,
	title,
	size = 600,
	loading,
	className,
	children,
	...props
}: ModalProps): JSX.Element => {
	const classNames = cn(
		{
			[css.root]: true,
			[css.centered]: props.centered,
		},
		className
	);

	return (
		<MantineModal
			opened={opened}
			onClose={onClose}
			closeButtonLabel="Закрыть"
			transition="fade"
			size={size}
			title={
				<div className={css.title}>
					{loading && <Loader size="sm" color={TailwindColors.primary.main} />}
					<TextField size="small" mode="heading" disabled={loading}>
						{title}
					</TextField>
				</div>
			}
			className={classNames}
			{...props}
		>
			<div className={cn(css.body, { [css.body__disabled]: loading })}>{children}</div>
		</MantineModal>
	);
};

const Buttons = ({ children, className }: ModalButtonProps): JSX.Element => {
	return <div className={cn(css.modalButtons, className)}>{children}</div>;
};

Modal.Buttons = Buttons;

export { Modal };
