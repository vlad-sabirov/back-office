import { IndicesIndexSettings, MappingProperty, QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { isEmpty, reduce } from 'lodash';
import { KeyboardHelper } from 'src/helpers/keyboard.helper';
import { ISearchIndex } from './types/search-index.types';
import { ISearchInit } from './types/search-init.types';
import { ISearch } from './types/search-search.types';

@Injectable()
export class SearchService {
	constructor(private readonly elasticService: ElasticsearchService) {}

	ping = async () => {
		return await this.elasticService.ping();
	};

	init = async <T>({ index, fields }: ISearchInit<T>) => {
		if (isEmpty(fields)) {
			return;
		}
		return await this.elasticService.indices.create({
			index,
			mappings: {
				properties: reduce(
					fields,
					(acc: Record<string, MappingProperty>, value, key) => {
						if (value === 'string') {
							acc[key] = { type: 'text', analyzer: 'customTextIndex' };
						}

						if (value === 'number') {
							acc[key] = { type: 'integer' };
						}

						if (value === 'keyword') {
							acc[key] = { type: 'keyword' };
						}

						return acc;
					},
					{}
				),
			},
			settings: this.getSettingsIndex(),
		});
	};

	delete = async (index: string) => {
		return await this.elasticService.indices.delete({ index });
	};

	deleteIndex = async ({ index, id }: { index: string; id: string }) => {
		return await this.elasticService.delete({ index, id });
	};

	index = async <T>({ index, id, body }: ISearchIndex<T>) => {
		return await this.elasticService.index({ index, id, body });
	};

	search = async <T>({ index, body, filter, take, skip }: ISearch<T>) => {
		return await this.elasticService.search<T>({
			index,
			query: {
				bool: {
					must_not: filter ? filter : [],
					should: reduce(
						body,
						(acc: QueryDslQueryContainer[], item, key) => {
							if (item?.type === 'string') {
								const valueLayoutRu = KeyboardHelper.layoutFromEnToRu(String(item.value).toLowerCase().trim());
								const valueLayoutEn = KeyboardHelper.layoutFromRuToEn(String(item.value).toLowerCase().trim());

								acc.push({
									wildcard: {
										[key]: {
											value: `*${item.value}*`,
											boost: 1.0,
											rewrite: 'constant_score',
										},
									},
								});

								acc.push({
									match: {
										[key]: {
											query: String(item.value).trim(),
											operator: 'and',
											fuzziness: 'auto',
										},
									},
								});

								acc.push({
									wildcard: {
										[key]: {
											value: `*${valueLayoutRu}*`,
											boost: 1.0,
											rewrite: 'constant_score',
										},
									},
								});

								acc.push({
									match: {
										[key]: {
											query: valueLayoutRu,
											operator: 'and',
											fuzziness: 'auto',
										},
									},
								});

								acc.push({
									wildcard: {
										[key]: {
											value: `*${valueLayoutEn}*`,
											boost: 1.0,
											rewrite: 'constant_score',
										},
									},
								});

								acc.push({
									match: {
										[key]: {
											query: valueLayoutEn,
											operator: 'and',
											fuzziness: 'auto',
										},
									},
								});
							}

							if (item?.type === 'keyword' || item?.type === 'number') {
								acc.push({
									match: {
										[key]: {
											query: String(item.value),
										},
									},
								});
							}

							return acc;
						},
						[]
					),
				},
			},
			size: take ?? 10000,
			from: skip,
		});
	};

	private getSettingsIndex = (): IndicesIndexSettings => ({
		analysis: {
			analyzer: {
				customTextIndex: {
					type: 'custom',
					tokenizer: 'ngram',
					filter: ['myLatinTransform', 'lowercase', 'trim', 'stop'],
				},
			},
			filter: {
				myLatinTransform: {
					type: 'icu_transform',
					id: 'Any-Latin; NFD; [:Nonspacing Mark:] Remove; NFC',
				},
			},
		},
	});
}
