import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {axiosInstance} from '../../api/axios';

// Async thunk for adding a new post
export const addNewPost = createAsyncThunk(
  'posts/addNewPost',
  async (formData, thunkAPI) => {
    try {
      const response = await axiosInstance.post('/api/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Ensure correct Content-Type
        },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({page, limit = 10}, thunkAPI) => {
    try {
      console.log('Fetching posts for page: ', page);
      const response = await axiosInstance.get(
        `/api/posts?page=${page}&limit=${limit}`,
      );
      // console.log('Posts response: ', response.data); // Add a log to see the complete response
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    totalPages: 0,
    currentPage: 1,
    loading: false,
    error: null,
  },
  reducers: {
    // You may add reducers for non-async operations if needed
  },
  extraReducers: builder => {
    builder
      // Handle the addNewPost async thunk
      .addCase(addNewPost.pending, state => {
        state.loading = true;
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload); // Add new post to the start of the list
        state.loading = false;
      })
      .addCase(addNewPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add post';
      })
      // Handle the fetchPosts async thunk
      .addCase(fetchPosts.pending, state => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        const {posts, totalPages, currentPage} = action.payload;
        state.posts = currentPage === 1 ? posts : [...state.posts, ...posts];
        state.totalPages = totalPages; // Ensure totalPages is set
        state.currentPage = currentPage;
        state.loading = false;
      })

      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch posts';
      });
  },
});

export default postsSlice.reducer;
