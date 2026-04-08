import { FC, memo, useCallback, useMemo, useState } from 'react';
import { IIncomingListProps } from './incoming-list.types';
import cn from 'classnames';
import { format, parseISO } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { useCrmCardShowContact, useCrmCardShowOrganization } from '@fsd/entities/crm-card';
import { useVoipActions } from '@fsd/entities/voip';
import { IAnalyticsItem, IAnalyticsItemWithStage } from '@fsd/entities/voip/api/res/analytics.res';
import { useGetCrmEntities } from '@fsd/entities/voip/lib';
import { IStaffEntity } from '@fsd/entities/voip/lib/use-get-crm-entities/use-get-crm-entities.types';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { AvatarGroup, AvatarProps, ContentBlock, Icon, Pagination, Tabs, TextField } from '@fsd/shared/ui-kit';
import { AudioPlayer } from '@fsd/shared/ui-kit/audio-player';
import { parsePhoneNumber } from '@helpers';
import css from './incoming-list.module.scss';

export const IncomingList: FC<IIncomingListProps> = (props) => {
	const { answered, missed, className } = props;
	const [activeTab, setActiveTab] = useState<string>('answered');
	const page = useStateSelector((state) => state.voip.config.incoming.page);
	const limit = useStateSelector((state) => state.voip.config.incoming.limit);

	const incomingAnswered = useMemo(() => answered.filter((c) => c.caller.length > 6), [answered]);

	const data = useMemo<IAnalyticsItemWithStage[]>(() => {
		if (activeTab === 'answered') return incomingAnswered.length > 0 ? incomingAnswered.toReversed() : [];
		if (activeTab === 'missed') return missed.length > 0 ? missed.toReversed() : [];
		return [];
	}, [activeTab, incomingAnswered, missed]);

	const crmEntities = useGetCrmEntities(
		activeTab === 'answered' ? incomingAnswered : activeTab === 'missed' ? missed : [],
		'caller',
	);

	const voipActions = useVoipActions();

	const handleChangePage = (page: number) => voipActions.setConfig({ incoming: { page } });
	const handleChangeLimit = (limit: number) => voipActions.setConfig({ incoming: { limit, page: 1 } });

	return (
		<div className={cn(css.root, className)}>
			<Tabs
				value={activeTab}
				onTabChange={(tab) => {
					setActiveTab(tab || 'answered');
					voipActions.setConfig({ incoming: { page: 1 } });
				}}
			>
				<Tabs.List>
					<Tabs.Tab value={'answered'} icon={<Icon name={'call-answered'} />}>
						Входящие
					</Tabs.Tab>
					<Tabs.Tab value={'missed'} icon={<Icon name={'call-missed'} />}>
						Пропущенные
					</Tabs.Tab>
				</Tabs.List>
			</Tabs>

			<ContentBlock withoutPaddingY withoutPaddingX>
				<div
					className={cn({
						[css.rowAnswered]: activeTab === 'answered',
						[css.rowMissed]: activeTab === 'missed',
					})}
				>
					<TextField className={css.head}>Дата</TextField>
					<TextField className={css.head}>Звонящий</TextField>
					<TextField className={css.head}>Номер компании</TextField>
					{activeTab === 'answered' && (
						<TextField className={css.head}>Запись звонка</TextField>
					)}
					<TextField className={css.head}>Ответственный</TextField>
				</div>

				{data
					.filter((_, i) => {
						const start = limit * (page - 1);
						const end = limit * (page - 1) + (limit - 1);
						return i >= start && i <= end;
					})
					.map((dataItem) => (
						<div
							key={dataItem.call_id}
							className={cn({
								[css.rowAnswered]: activeTab === 'answered',
								[css.rowMissed]: activeTab === 'missed',
							})}
						>
							<Date timestamp={dataItem.timestamp} />
							<Caller caller={dataItem.caller} crmEntity={crmEntities[dataItem.caller]} />
							<OfficePhone phone={dataItem.did} stages={dataItem.stages} />
							{activeTab === 'answered' && (
								<Audio file={dataItem.file} />
							)}
							<Staff
								stages={dataItem.stages}
								callMark={dataItem.call_mark}
								did={dataItem.did}
								receiver={dataItem.receiver}
								tab={activeTab}
							/>
						</div>
					))}

				<Pagination
					page={page}
					total={activeTab === 'answered' ? incomingAnswered.length : missed.length}
					limit={limit}
					onChangePage={handleChangePage}
					onChangeLimit={handleChangeLimit}
					limitSelect={[10, 15, 20, 25]}
					className={css.pagination}
				/>
			</ContentBlock>
		</div>
	);
};

const Date: FC<{ timestamp: string }> = ({ timestamp }) => {
	const formattedDate = format(parseISO(timestamp), 'dd MMMM', { locale: customLocaleRu });
	const formattedTime = format(parseISO(timestamp), 'iiiiii, HH:mm', { locale: customLocaleRu });

	return (
		<div>
			<TextField className={css.date}>{formattedDate}</TextField>
			<TextField size={'small'} className={css.time}>
				{formattedTime}
			</TextField>
		</div>
	);
};

const Caller: FC<{ caller: string; crmEntity: IStaffEntity | undefined }> = ({ caller, crmEntity }) => {
	const formattedPhone = parsePhoneNumber(caller).output;
	const showOrganization = useCrmCardShowOrganization();
	const showContact = useCrmCardShowContact();

	const handleShowOrganization = useCallback(() => {
		if (!crmEntity) return;
		showOrganization({ id: crmEntity.id });
	}, [crmEntity, showOrganization]);

	const handleShowContact = useCallback(() => {
		if (!crmEntity) return;
		showContact({ id: crmEntity.id });
	}, [crmEntity, showContact]);

	const handleShowOrg = useCallback(() => {
		if (!crmEntity?.orgId) return;
		showOrganization({ id: crmEntity.orgId });
	}, [crmEntity, showOrganization]);

	return (
		<div>
			<TextField className={css.callerPhone}>{formattedPhone}</TextField>
			{crmEntity && (
				<TextField
					className={css.callerName}
					size={'small'}
					onClick={() => {
						if (crmEntity?.type === 'organization') handleShowOrganization();
						if (crmEntity?.type === 'contact') handleShowContact();
					}}
				>
					{crmEntity.name}
				</TextField>
			)}
			{crmEntity?.type === 'contact' && crmEntity.orgName && (
				<TextField className={css.callerOrgName} size={'small'} onClick={handleShowOrg}>
					{crmEntity.orgName}
				</TextField>
			)}
		</div>
	);
};

const OfficePhone: FC<{ phone: string; stages: IAnalyticsItem[] }> = ({ phone, stages }) => {
	const formattedPhone = parsePhoneNumber(phone);
	const companyName = useMemo<string>(() => {
		if (formattedPhone.clear === '781503994') return 'Imex Group';
		if (formattedPhone.clear === '781503995') return 'Vertex Develop Group';
		if (formattedPhone.clear === '781503996') return 'High Power Trade';

		if (stages?.[0]?.queue === '6000') return 'ВЭД';
		if (stages?.[0]?.queue === '6001') return 'Секретариат';
		if (stages?.[0]?.queue === '6004') return 'Бухгалтерия';

		return 'Неизвестно';
	}, [formattedPhone.clear, stages]);

	return (
		<div>
			<TextField className={css.departmentPhone}>{formattedPhone.output}</TextField>
			<TextField className={css.departmentName} size={'small'}>
				{companyName}
			</TextField>
		</div>
	);
};

const Audio: FC<{ file: string }> = ({ file }) => {
	return <AudioPlayer src={file} />;
};

const Staff: FC<{ stages: IAnalyticsItem[]; callMark: string; did: string; tab: string; receiver: string }> = memo(
	({ stages, callMark, did, tab, receiver }) => {
		const staff = useStateSelector((state) => state.staff.data.voip);
		const users = useMemo<Omit<AvatarProps, 'size' | 'className'>[]>(() => {
			if (tab === 'missed') {
				const foundUser = staff[receiver];
				if (!foundUser) return [];
				return [{ color: foundUser.color, text: foundUser.initial, src: foundUser.photo }];
			}

			return stages.reduce((acc: Omit<AvatarProps, 'size' | 'className'>[], stage) => {
				if (!stage.file) return acc;
				if (!staff[stage.receiver]) return acc;

				const user = staff[stage.receiver];
				if (acc.some(({ src }) => user.photo === src)) return acc;

				acc.push({ color: user.color, text: user.initial, src: user.photo });
				return acc;
			}, []);
		}, [receiver, staff, stages, tab]);

		const type = useMemo<string>(() => {
			if (
				callMark === 'no_redirect_pre_queue' ||
				(did !== '781503994' && did !== '781503995' && did !== '781503996')
			) {
				return 'На очередь';
			}
			return 'Переадресация';
		}, [callMark, did]);

		return (
			<div className={css.staff}>
				<AvatarGroup data={users} limit={users.length} size={'small'} />
				<TextField className={css.type} size={'small'}>
					{type}
				</TextField>
			</div>
		);
	}
);
Staff.displayName = 'Staff';
