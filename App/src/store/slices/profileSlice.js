import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {axiosInstanceForm} from '../../api/axios';
import {updateAsyncStorage} from './authSlice';

export const saveProfile = createAsyncThunk(
  'profile/saveProfile',
  async (profileData, {rejectWithValue}) => {
    try {
      const response = await axiosInstanceForm.post(
        '/api/user/create-profile',
        profileData,
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

const initialState = {
  loading: false,
  error: null,
  name: '',
  profilePicture: '',
  location: '',
  interests: [],
  about: '',
  skills: [],
  experience: [],
  education: [],
  socialLinks: [],
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    createProfileRequest: state => {
      state.loading = true;
      state.error = null;
    },
    setName: (state, action) => {
      state.name = action.payload;
    },
    setProfilePicture: (state, action) => {
      state.profilePicture = action.payload;
    },
    setInterests: (state, action) => {
      state.interests = action.payload;
    },
    setAbout: (state, action) => {
      state.about = action.payload;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setSkills: (state, action) => {
      state.skills = action.payload;
    },
    setExperience: (state, action) => {
      state.experience = action.payload;
    },
    setEducation: (state, action) => {
      state.education = action.payload;
    },
    setSocialLinks: (state, action) => {
      state.socialLinks = action.payload;
    },
    createProfileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    populateProfile: (state, action) => {
      return {...state, ...action.payload};
    },
  },
  extraReducers: builder => {
    builder
      .addCase(saveProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Update the state with the saved profile data if needed
        updateAsyncStorage(action.payload.user);
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  createProfileRequest,
  setName,
  setProfilePicture,
  setInterests,
  setAbout,
  setLocation,
  setSkills,
  setExperience,
  setEducation,
  setSocialLinks,
  createProfileFailure,
  populateProfile,
} = profileSlice.actions;

export default profileSlice.reducer;
