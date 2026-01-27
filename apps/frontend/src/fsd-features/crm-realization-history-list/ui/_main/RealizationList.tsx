import { FC, useState } from 'react';
import { IRealizationListProps } from './realization-list.types';
import { ICrmRealizationMonthResEmployee, ICrmRealizationMonthResTeam } from '@fsd/entities/crm-realization';
import { CrmRealizationWhatIfFeature } from '@fsd/features/crm-realization-what-if';
import { TextField } from '@fsd/shared/ui-kit';
import { ReportItem } from '../report-item/ReportItem';
import css from './realization-list.module.scss';

export const RealizationList: FC<IRealizationListProps> = (props) => {
	const { data, all, userId, withDiff, type, parentId } = props;

	const [currentReport, setCurrentReport] = useState<
		ICrmRealizationMonthResTeam | ICrmRealizationMonthResEmployee | null
	>(null);
	const [isShowWhatIf, setIsShowWhatIf] = useState<boolean>(false);

	return (
		<>
			<div className={css.heading}>
				<TextField className={css.name}>Дата</TextField>
				<TextField className={css.name}>Реализация</TextField>
				<TextField className={css.name}>План</TextField>
				<TextField className={css.name}>Средний чек</TextField>
				<TextField className={css.name}>Глубина</TextField>
				<TextField className={css.name}>В базе</TextField>
				<TextField className={css.name}>Отгруз.</TextField>
			</div>

			{data?.map((report) => (
				<ReportItem
					key={`report_${report.year}_${report.month}`}
					data={report}
					all={all}
					userId={userId}
					withDiff={withDiff}
					parentId={parentId}
					type={type}
					setCurrentReport={setCurrentReport}
					setIsShowWhatIf={setIsShowWhatIf}
				/>
			))}

			<CrmRealizationWhatIfFeature report={currentReport} isOpen={isShowWhatIf} setIsOpen={setIsShowWhatIf} />
		</>
	);
};
