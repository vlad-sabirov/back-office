import { FC, useMemo, useState } from 'react';
import cn from 'classnames';
import { format, parseISO } from 'date-fns';
import { customLocaleRu } from '@config/date-fns.locale';
import { useCrmCardShowContact, useCrmCardShowOrganization } from '@fsd/entities/crm-card';
import { useVoipActions } from '@fsd/entities/voip';
import { IAnalyticsItemWithStage } from '@fsd/entities/voip/api/res/analytics.res';
import { useGetCrmEntities } from '@fsd/entities/voip/lib';
import { IStaffEntity } from '@fsd/entities/voip/lib/use-get-crm-entities/use-get-crm-entities.types';
import { useStateSelector } from '@fsd/shared/lib/hooks';
import { AvatarGroup, AvatarProps, ContentBlock, Icon, MultiSelect, Pagination, TextField } from '@fsd/shared/ui-kit';
import { AudioPlayer } from '@fsd/shared/ui-kit/audio-player';
import { parsePhoneNumber } from '@helpers';
import css from './outgoing-list.module.scss';

interface OutgoingListProps {
	calls: IAnalyticsItemWithStage[];
}

export const OutgoingList: FC<OutgoingListProps> = ({ calls }) => {
	const [selectedCallers, setSelectedCallers] = useState<string[]>([]);
	const page = useStateSelector((state) => state.voip.config.incoming.page);
	const limit = useStateSelector((state) => state.voip.config.incoming.limit);
	const staff = useStateSelector((state) => state.staff.data.voip);
	const voipActions = useVoipActions();

	const crmEntities = useGetCrmEntities(calls, 'receiver');

	const filterOptions = useMemo(() => {
		const extensions = [...new Set(calls.map((c) => c.caller))];
		return extensions.map((ext) => ({
			value: ext,
			label: staff[ext] ? `${staff[ext].name} (${ext})` : ext,
		}));
	}, [calls, staff]);

	const filteredCalls = useMemo(() => {
		const data = selectedCallers.length > 0 ? calls.filter((c) => selectedCallers.includes(c.caller)) : calls;
		return data.toReversed();
	}, [calls, selectedCallers]);

	const handleChangePage = (page: number) => voipActions.setConfig({ incoming: { page } });
	const handleChangeLimit = (limit: number) => voipActions.setConfig({ incoming: { limit, page: 1 } });

	return (
		<div className={css.root}>
			{filterOptions.length > 0 && (
				<MultiSelect
					data={filterOptions}
					value={selectedCallers}
					onChange={(val) => {
						setSelectedCallers(val);
						voipActions.setConfig({ incoming: { page: 1 } });
					}}
					placeholder="Все сотрудники"
					clearable
					className={css.filter}
				/>
			)}

			<ContentBlock withoutPaddingY withoutPaddingX>
				<div className={css.row}>
					<TextField className={css.head}>Дата</TextField>
					<TextField className={css.head}>Кому звонили</TextField>
					<TextField className={css.head}>Кто звонил</TextField>
					<TextField className={css.head}>Запись звонка</TextField>
					<TextField className={css.head}>Ответственный</TextField>
				</div>

				{filteredCalls
					.filter((_, i) => {
						const start = limit * (page - 1);
						const end = limit * (page - 1) + (limit - 1);
						return i >= start && i <= end;
					})
					.map((item) => (
						<div key={item.call_id} className={css.row}>
							<DateCell timestamp={item.timestamp} />
							<ReceiverCell receiver={item.receiver} crmEntity={crmEntities[item.receiver]} />
							<CallerExtensionCell extension={item.caller} />
							<AudioPlayer src={item.file} />
							<StaffCell stages={item.stages} caller={item.caller} />
						</div>
					))}

				<Pagination
					page={page}
					total={filteredCalls.length}
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

const DateCell: FC<{ timestamp: string }> = ({ timestamp }) => {
	const formattedDate = format(parseISO(timestamp), 'dd MMMM', { locale: customLocaleRu });
	const formattedTime = format(parseISO(timestamp), 'iiiiii, HH:mm', { locale: customLocaleRu });
	return (
		<div>
			<TextField className={css.date}>{formattedDate}</TextField>
			<TextField size={'small'} className={css.time}>{formattedTime}</TextField>
		</div>
	);
};

const ReceiverCell: FC<{ receiver: string; crmEntity: IStaffEntity | undefined }> = ({ receiver, crmEntity }) => {
	const formattedPhone = parsePhoneNumber(receiver).output;
	const showOrganization = useCrmCardShowOrganization();
	const showContact = useCrmCardShowContact();

	return (
		<div>
			<TextField className={css.phone}>{formattedPhone}</TextField>
			{crmEntity && (
				<TextField
					className={css.name}
					size={'small'}
					onClick={() => {
						if (crmEntity.type === 'organization') showOrganization({ id: crmEntity.id });
						if (crmEntity.type === 'contact') showContact({ id: crmEntity.id });
					}}
				>
					{crmEntity.name}
				</TextField>
			)}
			{crmEntity?.type === 'contact' && crmEntity.orgName && (
				<TextField
					className={css.orgName}
					size={'small'}
					onClick={() => crmEntity.orgId && showOrganization({ id: crmEntity.orgId })}
				>
					{crmEntity.orgName}
				</TextField>
			)}
		</div>
	);
};

const CallerExtensionCell: FC<{ extension: string }> = ({ extension }) => {
	const staff = useStateSelector((state) => state.staff.data.voip);
	const employee = staff[extension];
	return (
		<div>
			<TextField className={css.phone}>{extension}</TextField>
			{employee && (
				<TextField size={'small'} className={css.name}>{employee.name}</TextField>
			)}
		</div>
	);
};

const StaffCell: FC<{ stages: IAnalyticsItemWithStage['stages']; caller: string }> = ({ stages, caller }) => {
	const staff = useStateSelector((state) => state.staff.data.voip);

	const users = useMemo<Omit<AvatarProps, 'size' | 'className'>[]>(() => {
		return stages.reduce((acc: Omit<AvatarProps, 'size' | 'className'>[], stage) => {
			if (!stage.file) return acc;
			if (!staff[stage.receiver]) return acc;
			const user = staff[stage.receiver];
			if (acc.some(({ src }) => user.photo === src)) return acc;
			acc.push({ color: user.color, text: user.initial, src: user.photo });
			return acc;
		}, []);
	}, [stages, staff]);

	const callerUser = staff[caller];
	const displayUsers = users.length > 0 ? users : callerUser
		? [{ color: callerUser.color, text: callerUser.initial, src: callerUser.photo }]
		: [];

	return (
		<div className={css.staffCell}>
			<AvatarGroup data={displayUsers} limit={displayUsers.length} size={'small'} />
		</div>
	);
};
