import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RIFFormSectionData {
  [section: string]: any;
}

interface RIFFormState {
  currentStep: number;
  data: RIFFormSectionData;
  completedSteps: number[];
}

const initialState: RIFFormState = {
  currentStep: 0,
  data: {},
  completedSteps: [],
};

const rifFormSlice = createSlice({
  name: 'rifForm',
  initialState,
  reducers: {
    setRifStep(state, action: PayloadAction<number>) {
      state.currentStep = action.payload;
      if (!state.completedSteps.includes(action.payload - 1) && action.payload > 0) {
        state.completedSteps.push(action.payload - 1);
      }
    },
    setRifFormData(state, action: PayloadAction<{ section: string; data: any }>) {
      state.data = {
        ...state.data,
        [action.payload.section]: {
          ...state.data[action.payload.section],
          ...action.payload.data,
        },
      };
    },
    resetRifForm(state) {
      state.currentStep = 0;
      state.data = {};
      state.completedSteps = [];
    },
    setRifCompletedSteps(state, action: PayloadAction<number[]>) {
      state.completedSteps = action.payload;
    },
  },
}
  
);

export const {
  setRifStep,
  setRifFormData,
  resetRifForm,
  setRifCompletedSteps,
} = rifFormSlice.actions;

export default rifFormSlice.reducer;
