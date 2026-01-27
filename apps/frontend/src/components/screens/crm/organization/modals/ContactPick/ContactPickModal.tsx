import { FC, useState } from 'react';
import Head from 'next/head';
import { Modal, Stepper } from '@fsd/shared/ui-kit';
import { ContactPickModalT } from '.';
import { ConnectContact, DeleteContact, DisconnectContact, FindContact, MutationContact } from './components';
import { CrmContactResponse } from '@interfaces';

export const ContactPickModal: FC<ContactPickModalT> = (
	{ type, current, hasContactIds, hasPhoneData, hasEmailData, opened, setOpened, onSuccess }
) => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [title, setTitle] = useState<string>('');
	const [foundContacts, setFoundContacts] = useState<CrmContactResponse[]>([]);

	if (type === 'find') { return (<>
		{opened && (<Head><title>{title}</title></Head>)}
		<Modal
			title={title}
			size={480}
			opened={opened}
			onClose={() => setOpened(false)}
			loading={isLoading}
		>
			<Stepper
				loading={isLoading}
				setLoading={setIsLoading}
				stepsSpace={40}
				steps={[
					// 1. Поиск контакта
					<FindContact
						key={'find'}
						setModalVisible={setOpened}
						setTitle={setTitle}
						setFoundContacts={setFoundContacts}
						hasContactIds={hasContactIds}
					/>,

					// 2. Прикрепление или создание контакта
					foundContacts.length
					? <ConnectContact
							key={'connect'}
							contactsFound={foundContacts}
							setFoundContacts={setFoundContacts}
							setModalVisible={setOpened}
							setTitle={setTitle}
							onSuccess={onSuccess}
						/>
					: <MutationContact
							type={'create'}
							key={'mutation'}
							setModalVisible={setOpened}
							setTitle={setTitle}
							hasPhoneData={hasPhoneData}
							hasEmailData={hasEmailData}
							onSuccess={onSuccess}
						/>
				]}
			/>
		</Modal>
	</>); }

	if (type === 'update') { return (<>
		<Modal
			title={'Изменение контакта'}
			size={480}
			opened={opened}
			onClose={() => setOpened(false)}
			loading={isLoading}
		>
			<MutationContact
				type={'update'}
				current={current}
				setModalVisible={setOpened}
				setTitle={setTitle}
				hasPhoneData={hasPhoneData}
				hasEmailData={hasEmailData}
				onSuccess={onSuccess}
			/>
		</Modal>
	</>); }

	if (type === 'delete') { return (<>
		<Modal
			title={'Удаление контакта'}
			size={440}
			opened={opened}
			onClose={() => setOpened(false)}
			loading={isLoading}
		>
			<DeleteContact
				current={current}
				setModalVisible={setOpened}
				onSuccess={onSuccess}
			/>
		</Modal>
	</>); }

	if (type === 'disconnect') { return (<>
		<Modal
			title={'Открепление контакта'}
			size={440}
			opened={opened}
			onClose={() => setOpened(false)}
			loading={isLoading}
		>
			<DisconnectContact
				current={current}
				setModalVisible={setOpened}
				onSuccess={onSuccess}
			/>
		</Modal>
	</>); }

	return <></>;
};
