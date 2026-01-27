import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';

const ADDR = `${process.env.ELASTIC_CONTAINER_NAME}:${process.env.ELASTIC_DEFAULT_PORT}`;

@Module({
	imports: [
		ElasticsearchModule.registerAsync({
			useFactory: async () => ({ node: `http://${ADDR}` }),
		}),
	],
	providers: [SearchService],
	exports: [SearchService],
})
export class SearchModule {}
