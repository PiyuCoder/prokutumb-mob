import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {axiosInstance} from '../../api/axios';

// Async thunk to check if the user is registered
export const checkRegistration = createAsyncThunk(
  'user/checkRegistration',
  async ({token}, {rejectWithValue}) => {
    try {
      const response = await axiosInstance.post('/api/user/google-signin', {
        token, // sending the Google ID token
      });

      // Return the payload on success
      return response.data;
    } catch (error) {
      // Handle errors and return rejection
      return rejectWithValue(error.response.data);
    }
  },
);
export const registration = createAsyncThunk(
  'user/registration',
  async ({token, code}, {rejectWithValue}) => {
    try {
      const response = await axiosInstance.post('/api/user/google-signin', {
        token, // sending the Google ID token
        code,
      });

      // Return the payload on success
      return response.data;
    } catch (error) {
      // Handle errors and return rejection
      return rejectWithValue(error.response.data);
    }
  },
);

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null,
    isAuthenticated: false,
    isHr: false,
    needsRegistration: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: state => {
      state.user = null;
      state.isAuthenticated = false;
      state.isHr = false;
      state.needsRegistration = false;
    },
    removeFriendRequest: (state, action) => {
      const {senderId} = action.payload;
      console.log('Declining request from:', senderId);

      // Ensure comparison is done using string values
      state.friendRequests = state.friendRequests.filter(
        request => request._id.toString() !== senderId.toString(),
      );
    },
  },
  extraReducers: builder => {
    builder
      // Pending state
      .addCase(checkRegistration.pending, state => {
        state.loading = true;
        state.error = null;
      })
      // Fulfilled state
      .addCase(checkRegistration.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isHr = action.payload.isHr;
        state.needsRegistration = action.payload.needsRegistration;
      })
      .addCase(registration.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      // Rejected state
      .addCase(checkRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export const {logout, removeFriendRequest} = userSlice.actions;

export default userSlice.reducer;
