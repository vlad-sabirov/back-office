import { FC, useEffect, useMemo } from 'react';
import cn from 'classnames';
import { capitalize } from 'lodash';
import { CrmOrganizationTagService, useCrmOrganizationTagActions } from '@fsd/entities/crm-organization-tag';
import { FetchStatusConvert, FetchStatusIsLoading } from '@fsd/shared/lib/fetch-status';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { Button, Icon, Modal, TextField } from '@fsd/shared/ui-kit';
import { ITagListProps } from '../types/tag-list.props';
import css from './tag-list.module.scss';

export const TagList: FC<ITagListProps> = ({ className, ...props }) => {
	const data = useStateSelector((state) => state.crm_organization_tag.data.list);
	const isOpen = useStateSelector((state) => state.crm_organization_tag.modals.list);
	const tagActions = useCrmOrganizationTagActions();
	const status = useStateSelector((state) => state.crm_organization_tag.status.list);
	const isLoading = useMemo(() => FetchStatusIsLoading(status), [status]);
	const [fetchCurrent, { data: fetchCurrentData, ...fetchCurrentProps }] = CrmOrganizationTagService.getById();

	const handleClose = () => {
		tagActions.setModalShow({ modal: 'list', show: false });
	};

	const handleAdd = () => {
		tagActions.setModalShow({ modal: 'create', show: true });
	};

	const handleUpdate = (id: number) => {
		fetchCurrent(id);
		tagActions.setModalShow({ modal: 'update', show: true });
	};

	useEffect(() => {
		if (fetchCurrentData) {
			tagActions.setDataCurrent(fetchCurrentData);
		}
		tagActions.setStatusCurrent(FetchStatusConvert(fetchCurrentProps));
	}, [fetchCurrentProps, fetchCurrentData, tagActions]);

	return (
		<Modal title={'Теги'} size={440} opened={isOpen} onClose={handleClose} loading={isLoading}>
			<div className={cn(css.wrapper, className)} {...props}>
				<TextField size={'small'} className={css.description}>
					Ниже выведен список тегов. Вы можете добавить новый тег, либо отредактировать существующий. Обратите
					внимание, что теги также могут создавать и сотрудники отдела продаж.
				</TextField>

				<TextField size={'small'} className={css.description}>
					Всего тегов: {data.length}.
				</TextField>

				<div className={css.list}>
					{data.map((item) => {
						return (
							<Button key={item.id} color={'transparent'} onClick={() => handleUpdate(item.id)}>
								{' '}
								{capitalize(item.name)}{' '}
							</Button>
						);
					})}
				</div>

				<Modal.Buttons>
					<Button onClick={handleClose}> Отмена </Button>

					<Button
						color={'success'}
						variant={'hard'}
						iconLeft={<Icon name={'plus-medium'} style={{ width: 12 }} />}
						onClick={handleAdd}
					>
						{' '}
						Добавить{' '}
					</Button>
				</Modal.Buttons>
			</div>
		</Modal>
	);
};
