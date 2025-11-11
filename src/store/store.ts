// store.js
import { configureStore } from '@reduxjs/toolkit';
import commonReducer from '../store/slice/commonSlice';
const store = configureStore({
  reducer: {
    common: commonReducer,

    // Add your slice reducers here
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
