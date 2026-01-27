import { FC, useCallback, useMemo, useState } from 'react';
import { Empty } from './Empty';
import { Filled } from './Filled';
import { IFormOrgOrContProps } from './form-org-or-cont.types';
import { useUser } from '@fsd/shared/lib/hooks';
import { Button, Icon, Modal } from '@fsd/shared/ui-kit';

export const FormOrgOrCont: FC<IFormOrgOrContProps> = (props) => {
	const { getRoles } = useUser();
	const { value } = props;
	const [isShowModal, setIsShowModal] = useState<boolean>(false);

	const roles = useMemo<string[]>(() => getRoles() || [], [getRoles]);

	const handleModalClose = useCallback(() => {
		setIsShowModal(false);
	}, []);

	return (
		<>
			<Button
				iconLeft={<Icon name={'calendar'} />}
				color={value ? 'primary' : 'neutral'}
				size={'small'}
				onClick={() => setIsShowModal(true)}
				disabled={!roles.includes('crm')}
			>
				Контакт
			</Button>

			<Modal opened={isShowModal} onClose={handleModalClose} title={'Прикрепить'} size={480}>
				{value ? <Filled {...props} /> : <Empty {...props} setIsShowModal={setIsShowModal} />}
			</Modal>
		</>
	);
};
