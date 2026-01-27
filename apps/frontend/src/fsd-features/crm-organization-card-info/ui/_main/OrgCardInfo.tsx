import { useCallback, useMemo } from 'react';
import cn from 'classnames';
import { format, parseISO } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { CrmCardEmails } from '@fsd/entities/crm-email';
import { CrmOrganizationConst, CrmOrganizationIconBattery } from '@fsd/entities/crm-organization';
import { CrmCardOrganizationTags } from '@fsd/entities/crm-organization-tag';
import { CrmCardOrganizationType } from '@fsd/entities/crm-organization-type';
import { CrmCardPhones } from '@fsd/entities/crm-phone';
import { useAccess, useStateSelector } from '@fsd/shared/lib/hooks';
import { Alert, Button, Icon, TextField } from '@fsd/shared/ui-kit';
import { useUserDeprecated } from '@hooks';
import { Const } from '../../config/const';
import { useActions } from '../../lib/use-actions';
import { ModalChangeUserId } from '../modal-change-user-id/ModalChangeUserId';
import { ModalFromArchive } from '../modal-from-archive/ModalFromArchive';
import { ModalToArchive } from '../modal-to-archive/ModalToArchive';
import { ModalToFreedom } from '../modal-to-freedom/ModalToFreedom';
import { ModalToPriority } from '../modal-to-priority/ModalToPriority';
import { ModalToVerified } from '../modal-to-verified/ModalToVerified';
import { ModalUpdateOrganization } from '../modal-update-organization/ModalUpdateOrganization';
import css from './org-card-info.module.scss';

const mainDate = new Date('1990-08-19');

export const OrgCardInfo = () => {
	const current = useStateSelector((state) => state.crm_organization.data.current);
	const actions = useActions();
	const { team } = useUserDeprecated();
	const isArchiveAccess = useAccess({ access: Const.Access.ToArchive });
	const isAdmin = useAccess({ access: CrmOrganizationConst.Access.Admin });

	const lastUpdate1C = useMemo(() => {
		const updateDate = current?.last1CUpdate ? parseISO(current.last1CUpdate) : mainDate;
		return updateDate <= mainDate
			? 'Начиная с сентября 2022 года нет данных'
			: format(updateDate, 'Последнее действие: dd MMMM yyyy', { locale: customLocaleRu });
	}, [current]);

	// Access
	const hasAccessChangeUserIdAdmin: boolean = useAccess({ access: Const.Access.ChangeUserId }) ?? false;
	const hasAccessChangeUserIdTeam: boolean = useMemo(() => {
		return current && team ? team.includes(current.userId ?? 0) : false;
	}, [current, team]);
	const hasAccessChangeUserId = useMemo(() => {
		return hasAccessChangeUserIdAdmin || hasAccessChangeUserIdTeam;
	}, [hasAccessChangeUserIdAdmin, hasAccessChangeUserIdTeam]);

	const handleOpenModalChangeUserId = useCallback(() => {
		actions.setModal(['changeUserId', true]);
	}, [actions]);

	const handleOpenModalUpdateOrganization = useCallback(() => {
		actions.setModal(['updateOrganization', true]);
	}, [actions]);

	const handleOpenModalToArchive = useCallback(() => {
		actions.setModal(['toArchive', true]);
	}, [actions]);

	const handleOpenModalToVerified = useCallback(() => {
		actions.setModal(['toVerified', true]);
	}, [actions]);

	const handleOpenModalToFreedom = useCallback(() => {
		actions.setModal(['toFreedom', true]);
	}, [actions]);

	const handleOpenModalToPriority = useCallback(() => {
		actions.setModal(['toPriority', true]);
	}, [actions]);

	const handleOpenModalFromArchive = useCallback(() => {
		actions.setModal(['fromArchive', true]);
	}, [actions]);

	if (!current) return <></>;
	return (
		<>
			<div className={css.wrapper}>
				{current.isArchive && (
					<Alert
						title={'Архив'}
						body={'Организация находится в архиве. Возможно она уже не работает.'}
						color={'info'}
						variant={'outline'}
						icon={<Icon name={'information'} />}
						className={css.alert}
					/>
				)}
				{!current?.isVerified && (
					<TextField className={css.website}>
						Расходная накладная: <span>{current.firstDocument}</span>
					</TextField>
				)}
				{!!current.userId && (
					<TextField className={css.from1C}>
						Последнее действие в 1С:
						<span>
							<CrmOrganizationIconBattery updatedAt={current.last1CUpdate} /> {lastUpdate1C}
						</span>
					</TextField>
				)}
				<TextField
					className={cn(css.workPosition, {
						[css.workPosition__clickable]: hasAccessChangeUserId && !current?.isArchive,
					})}
					onClick={() => {
						if (!hasAccessChangeUserId || current?.isArchive) {
							return;
						}
						handleOpenModalChangeUserId();
					}}
				>
					Ответственный:{' '}
					<span>
						{' '}
						{current.isArchive ? (
							<>Удален. Находится в архиве...</>
						) : current.user?.id ? (
							current.user?.id === 1 ? (
								<>Приоритетные</>
							) : (
								<>
									{current.user?.lastName} {current.user?.firstName}
								</>
							)
						) : (
							<>Свободные</>
						)}
					</span>
				</TextField>
				<CrmCardOrganizationType type={current.type} />
				<CrmCardPhones phones={current.phones} name={`${current.nameRu} (${current.nameEn})`} />
				<CrmCardEmails emails={current.emails} />
				{current.website && (
					<TextField className={css.website}>
						Вебсайт: <span>{current.website}</span>
					</TextField>
				)}
				<CrmCardOrganizationTags tags={current.tags} />
				{!!current.comment && <TextField className={css.comment}>Комментарий: {current.comment}</TextField>}
				<div className={css.actions}>
					{!current?.isArchive && (
						<TextField className={css.action} onClick={handleOpenModalUpdateOrganization}>
							{' '}
							изменить{' '}
						</TextField>
					)}

					{isArchiveAccess && !current?.isArchive && (
						<>
							<TextField
								className={cn(css.action, css.action__toArchive)}
								onClick={handleOpenModalToArchive}
							>
								{' '}
								<Icon name={'trash'} />
								отправить в архив{' '}
							</TextField>
						</>
					)}

					{isArchiveAccess && current?.isArchive && (
						<>
							<TextField
								className={cn(css.action, css.action__fromArchive)}
								onClick={handleOpenModalFromArchive}
							>
								{' '}
								<Icon name={'upload'} />
								восстановить из архива
							</TextField>
						</>
					)}
				</div>
				{isAdmin && !current?.isVerified && (
					<div className={css.verified}>
						<Button
							color={'success'}
							iconLeft={<Icon name={'checkbox'} />}
							onClick={handleOpenModalToVerified}
						>
							Подтвердить организацию сотруднику
						</Button>

						<Button
							color={'warning'}
							iconLeft={<Icon name={'crm-filter-priority'} />}
							onClick={handleOpenModalToPriority}
						>
							Отправить в приоритетные
						</Button>

						<Button
							color={'primary'}
							iconLeft={<Icon name={'crm-filter-freedom'} />}
							onClick={handleOpenModalToFreedom}
						>
							Отправить в свободные
						</Button>
					</div>
				)}
			</div>

			<ModalChangeUserId />
			<ModalUpdateOrganization />
			<ModalToArchive />
			<ModalToVerified />
			<ModalToPriority />
			<ModalToFreedom />
			<ModalFromArchive />
		</>
	);
};
