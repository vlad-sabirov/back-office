import { Module } from '@nestjs/common';
import { FileModule } from '../file/file.module';

import { LogisticVedOrderController } from './controllers/logistic-ved-order.controller';
import { LogisticVedStageController } from './controllers/logistic-ved-stage.controller';
import { LogisticVedCommentController } from './controllers/logistic-ved-comment.controller';
import { LogisticVedHistoryController } from './controllers/logistic-ved-history.controller';
import { LogisticVedFileController } from './controllers/logistic-ved-file.controller';

import { LogisticVedOrderService } from './services/logistic-ved-order.service';
import { LogisticVedStageService } from './services/logistic-ved-stage.service';
import { LogisticVedCommentService } from './services/logistic-ved-comment.service';
import { LogisticVedHistoryService } from './services/logistic-ved-history.service';
import { LogisticVedFileService } from './services/logistic-ved-file.service';

@Module({
	providers: [
		LogisticVedStageService,
		LogisticVedOrderService,
		LogisticVedCommentService,
		LogisticVedHistoryService,
		LogisticVedFileService,
	],

	controllers: [
		LogisticVedStageController,
		LogisticVedOrderController,
		LogisticVedCommentController,
		LogisticVedHistoryController,
		LogisticVedFileController,
	],

	imports: [FileModule],
})
export class LogisticVedModule {}
