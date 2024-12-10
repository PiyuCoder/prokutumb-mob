import {configureStore} from '@reduxjs/toolkit';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {combineReducers} from 'redux';
import postsReducer from './slices/postSlice';
import authReducer from './slices/authSlice';
import commReducer from './slices/commPostSlice';

// Persist Config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'posts', 'commposts'],
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  posts: postsReducer,
  commposts: commReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with middleware to handle non-serializable actions
const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these redux-persist actions as they contain non-serializable values
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        warnAfter: 128,
      },
      immutableCheck: {warnAfter: 128},
    }),
});

export const persistor = persistStore(store);
export default store;
