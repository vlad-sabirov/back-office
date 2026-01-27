import { ICrmContactFormEntity } from "@fsd/entities/crm-contact/entity";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICrmContactEntity } from "@fsd/entities/crm-contact";
import { Const } from "../../config/const";
import { initialState } from "./contact-card-slice.init";

import {
	IContactCardReducerSetCreateError,
	IContactCardReducerSetCreateForm,
	IContactCardReducerSetModal,
	IContactCardReducerSetSearchForm, IContactCardReducerSetUpdateError, IContactCardReducerSetUpdateForm,
	IContactCardSliceInitialState
} from "./contact-card-slice.types";

const contactCardSlice = createSlice({
	name: Const.State.ReducerName,
	initialState,
	reducers: {
		setLoading: (state, payload: PayloadAction<boolean>) => {
			state.loading = payload.payload;
		},
		setModal: (state, payload: IContactCardReducerSetModal) => {
			state.modals[payload.payload[0]] = payload.payload[1];
		},
		setCurrent: (state, payload: PayloadAction<ICrmContactFormEntity | null>) => {
			state.current = payload.payload;
		},
		setSearchForm: (state, payload: IContactCardReducerSetSearchForm) => {
			state.forms.search = {
				...state.forms.search,
				...payload.payload,
			};
		},
		setCreateForm: (state, payload: IContactCardReducerSetCreateForm) => {
			state.forms.create = {
				...state.forms.create,
				...payload.payload,
			};
		},
		setCreateError: (state, payload: IContactCardReducerSetCreateError) => {
			state.errors.create = {
				...state.errors.create,
				...payload.payload,
			};
		},
		setUpdateForm: (state, payload: IContactCardReducerSetUpdateForm) => {
			state.forms.update = {
				...state.forms.update,
				...payload.payload,
			};
		},
		setUpdateError: (state, payload: IContactCardReducerSetUpdateError) => {
			state.errors.update = {
				...state.errors.update,
				...payload.payload,
			};
		},
		setSearchClear: (state) => {
			state.searchStep = 'search';
			state.forms = initialState.forms;
			state.errors = initialState.errors;
		},
		setSearchStep: (state, payload: PayloadAction<IContactCardSliceInitialState['searchStep']>) => {
			state.searchStep = payload.payload;
		},
		setSearchResult: (state, payload: PayloadAction<ICrmContactEntity[]>) => {
			state.searchResult = payload.payload;
		}
	}
});

export const ContactCardReducer = contactCardSlice.reducer;
export const ContactCardActions = contactCardSlice.actions;
