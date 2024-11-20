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
export const editPost = createAsyncThunk(
  'posts/editPost',
  async ({formData, postId}, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/api/posts/${postId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Ensure correct Content-Type
          },
        },
      );
      return {postId, updatedPost: response.data};
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(`/api/posts/${postId}`);
      return {postId};
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async ({page, limit = 10, userId}, thunkAPI) => {
    try {
      console.log('Fetching posts for page: ', userId);
      const response = await axiosInstance.get(
        `/api/posts/${userId}?page=${page}&limit=${limit}`,
      );
      // console.log('Posts response: ', response.data); // Add a log to see the complete response
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async ({userId, postId}, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/api/posts/like/${postId}`, {
        userId,
      });
      return {postId, userId};
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);
export const likePostUserScreen = createAsyncThunk(
  'posts/likePostUserScreen',
  async ({userId, postId}, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/api/posts/like/${postId}`, {
        userId,
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const commentOnPost = createAsyncThunk(
  'posts/commentOnPost',
  async ({postId, userId, content}, thunkAPI) => {
    // console.log('Commented!');
    try {
      console.log({postId, userId, content});
      const response = await axiosInstance.post(
        `/api/posts/comment/${postId}`,
        {userId, content},
      );
      console.log(response.data);
      return {postId, lastComment: response.data};
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);
export const commentOnPostUserScreen = createAsyncThunk(
  'posts/commentOnPostUserScreen',
  async ({postId, userId, content}, thunkAPI) => {
    // console.log('Commented!');
    try {
      console.log({postId, userId, content});
      const response = await axiosInstance.post(
        `/api/posts/comment/${postId}`,
        {userId, content},
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const incrementShare = createAsyncThunk(
  'posts/incrementShare',
  async (postId, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/api/posts/share/${postId}`);

      return {postId};
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);
export const incrementShareUserScreen = createAsyncThunk(
  'posts/incrementShareUserScreen',
  async (postId, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/api/posts/share/${postId}`);

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
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
      .addCase(editPost.fulfilled, (state, action) => {
        const {postId, updatedPost} = action.payload;
        const postIndex = state.posts.findIndex(post => post._id === postId);
        state.posts[postIndex] = updatedPost;
        state.loading = false;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        const {postId} = action.payload;
        state.posts = state.posts.filter(post => post._id !== postId);
        state.loading = false;
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
      })
      .addCase(likePost.fulfilled, (state, action) => {
        const {postId, userId} = action.payload; // Assume the payload contains `postId` and `userId`.
        const postIndex = state.posts.findIndex(post => post._id === postId);

        if (postIndex !== -1) {
          const post = state.posts[postIndex];

          // Toggle like logic
          if (post.likes.includes(userId)) {
            post.likes = post.likes.filter(id => id !== userId);
          } else {
            post.likes.push(userId);
          }

          state.loading = false;
        }
      })
      .addCase(commentOnPost.fulfilled, (state, action) => {
        const {postId, lastComment} = action.payload;
        const postIndex = state.posts.findIndex(post => post._id === postId);

        if (postIndex !== -1) {
          state.posts[postIndex].comments.push(lastComment);
        }
      })
      .addCase(incrementShare.fulfilled, (state, action) => {
        const {postId} = action.payload;
        const postIndex = state.posts.findIndex(post => post._id === postId);

        if (postIndex !== -1) {
          state.posts[postIndex].shares += 1; // Increment the share count
        }
      })
      .addCase(incrementShareUserScreen.fulfilled, (state, action) => {})
      .addCase(likePostUserScreen.fulfilled, (state, action) => {})
      .addCase(commentOnPostUserScreen.fulfilled, (state, action) => {});
  },
});

export default postsSlice.reducer;
