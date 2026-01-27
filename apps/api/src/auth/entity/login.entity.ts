import { PayloadEntity } from './payload.entity';
import { TokensEntity } from './tokens.entity';

export interface LoginEntity {
	user: PayloadEntity;
	tokens: TokensEntity;
}
