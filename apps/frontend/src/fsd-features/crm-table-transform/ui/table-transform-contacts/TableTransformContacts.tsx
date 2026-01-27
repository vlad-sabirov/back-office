import { CrmCardTypes, useCrmCardShowDrawer } from "@fsd/entities/crm-card";
import { ICrmContactEntity } from "@fsd/entities/crm-contact";
import { TextField, TextFiendPropsSize } from "@fsd/shared/ui-kit";
import { Popover } from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import { FC, ReactNode, useState } from "react";
import css from "./table-transform-contacts.module.scss";

interface IExec {
	contacts: ICrmContactEntity[] | null,
	size?: typeof TextFiendPropsSize[number],
}
type IResponse = (props: IExec) => { output: ReactNode, index: string }

export const useTableTransformContacts = (): IResponse => {
	const showDrawer = useCrmCardShowDrawer();

	const handleCardOpen = (id: string | number) => {
		showDrawer({ id, type: CrmCardTypes.Contact });
	}

	return ({ contacts, size }: IExec) => {
		if (!contacts || !contacts.length) {
			return { output: null, index: '' };
		}
		let output = <PopoverContacts contacts={contacts} handleCardOpen={handleCardOpen} size={size} />
		if (contacts.length === 1) {
			output = (
				<TextField
					className={css.once}
					size={size}
					onClick={() => handleCardOpen(contacts[0].id)}
				> {contacts[0].name} </TextField>
			);
		}

		return { output, index: '' };
	};
}


interface IPopoverContactsProps {
	contacts: ICrmContactEntity[] | null,
	handleCardOpen: (id: string | number) => void,
	size?: typeof TextFiendPropsSize[number],
}
const PopoverContacts: FC<IPopoverContactsProps> = (
	{ contacts, handleCardOpen, size }
) => {
	const [opened, setOpened] = useState<boolean>(false);
	const ref = useClickOutside(() => setOpened(false));

	const handleClick = (id: string | number) => {
		handleCardOpen(id);
		setOpened(false);
	}

	if (!contacts) { return null; }
	return (
		<>
			<Popover 
				// width={} 
				radius={'md'} 
				offset={-4}
				shadow={'xl'}
				position={'top-start'}
				withArrow
				opened={opened}
				onChange={setOpened}
			>
				<Popover.Target>
					<div onClick={() => setOpened((o) => !o)}>
						<TextField size={size} className={css.many}>{contacts[0].name} ...</TextField>
					</div>
				</Popover.Target>
				<Popover.Dropdown>
					<div className={css.manyWrapper} ref={ref}>
						{contacts.map((contact) => (
							<div 
								key={contact.id} 
								className={css.manyItem} 
								onClick={() => handleClick(contact.id)}
							>
								<TextField className={css.manyName}> {contact.name} </TextField>

								<TextField className={css.manyWorkPosition}>
									{contact.workPosition}
								</TextField>
							</div>
						))}
					</div>
				</Popover.Dropdown>
			</Popover>
		</>
	);
}
