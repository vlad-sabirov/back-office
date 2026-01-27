import { IPhoneEntity, IPhoneFormEntity } from '../../entity';

export interface ICardPhonesProps {
	phones: (IPhoneEntity | IPhoneFormEntity)[] | undefined;
	name: string;
}
