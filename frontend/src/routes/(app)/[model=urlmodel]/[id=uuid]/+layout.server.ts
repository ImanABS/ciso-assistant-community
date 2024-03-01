import { BASE_API_URL, ISO_8601_REGEX } from '$lib/utils/constants';
import { getModelInfo, processObject, type ModelMapEntry, URL_MODEL_MAP } from '$lib/utils/crud';
import { tableSourceMapper, type TableSource } from '@skeletonlabs/skeleton';

import { modelSchema } from '$lib/utils/schemas';
import { listViewFields } from '$lib/utils/table';
import { superValidate } from 'sveltekit-superforms/server';
import { z, type AnyZodObject } from 'zod';
import type { LayoutServerLoad } from './$types';
import type { SuperValidated } from 'sveltekit-superforms';
import type { urlModel } from '$lib/utils/types';

import { languageTag } from '$paraglide/runtime';

export const load: LayoutServerLoad = async ({ fetch, params, cookies }) => {
	const endpoint = `${BASE_API_URL}/${params.model}/${params.id}/`;

	const res = await fetch(endpoint);
	const data = await res.json();

	processObject(data, ISO_8601_REGEX, (matchedString: string): string =>
		new Date(matchedString).toLocaleString(cookies.get("lang") || languageTag()) // languageTag() seems to always return "en"
	);

	type RelatedModel = {
		urlModel: urlModel;
		info: ModelMapEntry;
		table: TableSource;
		deleteForm: SuperValidated<AnyZodObject>;
		createForm: SuperValidated<AnyZodObject>;
		foreignKeys: Record<string, any>;
		selectOptions: Record<string, any>;
	};

	type RelatedModels = {
		[K in urlModel]: RelatedModel;
	};

	const model = getModelInfo(params.model);
	const relatedModels = {} as RelatedModels;

	if (model.reverseForeignKeyFields) {
		const initialData = {};
		await Promise.all(
			model.reverseForeignKeyFields.map(async (e) => {
				const relEndpoint = `${BASE_API_URL}/${e.urlModel}/?${e.field}=${params.id}`;
				const res = await fetch(relEndpoint);
				const revData = await res.json().then((res) => res.results);

				const tableFields = listViewFields[e.urlModel];
				const index = tableFields.body.indexOf(e.field);
				if (index > -1) {
					tableFields.head.splice(index, 1);
					tableFields.body.splice(index, 1);
				}
				const bodyData = tableSourceMapper(revData, tableFields.body);

				const table: TableSource = {
					head: tableFields.head,
					body: bodyData,
					meta: revData
				};

				const info = getModelInfo(e.urlModel);
				const urlModel = e.urlModel;

				const deleteForm = await superValidate(z.object({ id: z.string().uuid() }));
				const createSchema = modelSchema(e.urlModel);
				initialData[e.field] = data.id;
				const createForm = await superValidate(initialData, createSchema, { errors: false });

				const foreignKeys: Record<string, any> = {};

				if (info.foreignKeyFields) {
					for (const keyField of info.foreignKeyFields) {
						const queryParams = keyField.urlParams ? `?${keyField.urlParams}` : '';
						const url = `${BASE_API_URL}/${keyField.urlModel}/${queryParams}`;
						const response = await fetch(url);
						if (response.ok) {
							foreignKeys[keyField.field] = await response.json().then((data) => data.results);
						} else {
							console.error(`Failed to fetch data for ${keyField.field}: ${response.statusText}`);
						}
					}
				}

				const selectOptions: Record<string, any> = {};

				if (info.selectFields) {
					for (const selectField of info.selectFields) {
						const url = `${BASE_API_URL}/${urlModel}/${selectField.field}/`;
						const response = await fetch(url);
						if (response.ok) {
							selectOptions[selectField.field] = await response.json().then((data) =>
								Object.entries(data).map(([key, value]) => ({
									label: value,
									value: key
								}))
							);
						} else {
							console.error(
								`Failed to fetch data for ${selectField.field}: ${response.statusText}`
							);
						}
					}
				}
				relatedModels[e.urlModel] = {
					urlModel,
					info,
					table,
					deleteForm,
					createForm,
					foreignKeys,
					selectOptions
				};
			})
		);
	}
	return { data, relatedModels, urlModel: params.model, model: URL_MODEL_MAP[params.model] };
};
