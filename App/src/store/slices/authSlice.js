import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {axiosInstance, axiosInstanceForm} from '../../api/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState = {
  token: null,
  user: null, // Add user information to the initial state
  isAuthenticated: false,
  status: 'idle', // for tracking loading status
  error: null,
};

export const editAbout = createAsyncThunk(
  'auth/editAbout',
  async ({userId, about}, {rejectWithValue}) => {
    try {
      // API call to update the user information
      const response = await axiosInstance.put(`/api/user/about/${userId}`, {
        about,
      });
      return response.data; // Return the updated user data
    } catch (error) {
      return rejectWithValue(error.response.data); // Handle error response
    }
  },
);

export const editProfile = createAsyncThunk(
  'auth/editProfile',
  async (formData, {rejectWithValue}) => {
    try {
      // API call to update the user information
      const response = await axiosInstanceForm.put(
        `/api/user/profile/${formData.userId}`,

        formData,
      );
      return response.data; // Return the updated user data
    } catch (error) {
      return rejectWithValue(error.response.data); // Handle error response
    }
  },
);

// Thunk for adding a new experience
export const editUserExperience = createAsyncThunk(
  'user/editExperience',
  async ({userId, experience}, {rejectWithValue, getState}) => {
    try {
      // const { token } = getState().auth; // Get token from auth state
      const response = await axiosInstance.put(
        `api/user/${userId}/experience`,
        {
          experience,
        },
      );
      console.log(response.data.user);
      return response.data; // Return updated user data
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to add experience',
      );
    }
  },
);

// Thunk for deleting an experience
export const deleteUserExperience = createAsyncThunk(
  'user/deleteExperience',
  async ({userId, experienceId}, {rejectWithValue, getState}) => {
    try {
      // const { token } = getState().auth;
      const response = await axiosInstance.delete(
        `api/user/${userId}/experience/${experienceId}`,
      );
      return response.data; // Return updated user data
    } catch (error) {
      return rejectWithValue(
        error.response?.data || 'Failed to delete experience',
      );
    }
  },
);

const updateAsyncStorage = user => {
  // Update AsyncStorage with the new user data
  AsyncStorage.setItem('user', JSON.stringify(user))
    .then(() => {
      console.log('User data saved to AsyncStorage');
    })
    .catch(error => {
      console.error('Failed to save user data to AsyncStorage:', error);
    });
};
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token; // Store token
      state.user = action.payload.user; // Store user information
      state.isAuthenticated = true;
    },
    logout: state => {
      state.token = null;
      state.user = null; // Clear user information on logout
      state.isAuthenticated = false;
    },
  },
  extraReducers: builder => {
    builder
      // Handle the editAbout thunk
      .addCase(editAbout.pending, state => {
        state.status = 'loading';
      })
      .addCase(editAbout.fulfilled, (state, action) => {
        state.status = 'succeeded';
        console.log(action.payload);
        state.user = action.payload.user; // Update "About" in user data
        updateAsyncStorage(action.payload.user);
      })
      .addCase(editAbout.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Handle the editProfile thunk
      .addCase(editProfile.pending, state => {
        state.status = 'loading';
      })
      .addCase(editProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        console.log(action.payload);
        state.user = action.payload.user;
        updateAsyncStorage(action.payload.user);
      })
      .addCase(editProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Handle the Add experience thunk
      .addCase(editUserExperience.pending, state => {
        state.status = 'loading';
      })
      .addCase(editUserExperience.fulfilled, (state, action) => {
        state.status = 'succeeded';
        console.log(action.payload);
        state.user = action.payload.user;
        updateAsyncStorage(action.payload.user);
      })
      .addCase(editUserExperience.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Handle the delete Experience thunk
      .addCase(deleteUserExperience.pending, state => {
        state.status = 'loading';
      })
      .addCase(deleteUserExperience.fulfilled, (state, action) => {
        state.status = 'succeeded';
        console.log(action.payload);
        state.user = action.payload.user; // Update "About" in user data
      })
      .addCase(deleteUserExperience.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Export the actions
export const {loginSuccess, logout} = authSlice.actions;

// Export the reducer
export default authSlice.reducer;
