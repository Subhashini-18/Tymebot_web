import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Example: import your slices here
// import userReducer from './userSlice';
import rifFormReducer from './slice/rifFormSlice';
import commonReducer from './slice/commonSlice';
import clientOnboardingReducer from './slice/clientOnboardingSlice';
import clientDirectoryReducer from './slice/clientDirectorySlice';
import vendorDirectoryReducer from './slice/vendorDirectorySlice';
import vendorOnboardingReducer from './slice/vendorOnboardingSlice';
import menuReducer from './slice/menuSlice';
import questionnaireReducer from './slice/questionnaireSlice';
import platformDashboardReducer from './slice/platformDashboardSlice';
import clientDashboardReducer from './slice/clientDashboardSlice';
import approverReducer from './slice/approverSlice';

// ...import other slices as needed...

// Combine all reducers for scalability
const rootReducer = combineReducers({
    // user: userReducer,
    rifForm: rifFormReducer,
    common: commonReducer,
    clientOnboarding: clientOnboardingReducer,
    clientDirectory: clientDirectoryReducer,
    vendorDirectory: vendorDirectoryReducer,
    vendorOnboarding: vendorOnboardingReducer,
    menuData: menuReducer,
    questionnaire: questionnaireReducer,
    platformDashboard: platformDashboardReducer,
    clientDashboard: clientDashboardReducer,
    approver: approverReducer,

    // ...add more slices here...
});

export const store = configureStore({
    reducer: rootReducer,
    devTools: process.env.NODE_ENV !== 'production',
});

// Types for use throughout the app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for usage in components
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default rootReducer;
