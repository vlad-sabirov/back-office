import { IAnalyticsItemWithStage } from '@fsd/entities/voip/api/res/analytics.res';

export interface IIncomingListProps {
	answered: IAnalyticsItemWithStage[];
	missed: IAnalyticsItemWithStage[];
	className?: string;
}
