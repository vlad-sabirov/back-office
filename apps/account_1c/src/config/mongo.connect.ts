import { MongooseModule } from '@nestjs/mongoose';

const HOST = process.env.ACCOUNT_1C_MONGO_CONTAINER_NAME;
const LOGIN = process.env.ACCOUNT_1C_MONGO_AUTH_LOGIN;
const PASSWORD = process.env.ACCOUNT_1C_MONGO_AUTH_PASSWORD;
const uri = `mongodb://${LOGIN}:${PASSWORD}@${HOST}:27017`;

export const MongoConnect = MongooseModule.forRootAsync({
	useFactory: () => ({ uri }),
});
