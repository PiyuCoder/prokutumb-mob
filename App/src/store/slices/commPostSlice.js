import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {axiosInstance, axiosInstanceForm} from '../../api/axios';

// Async thunk for adding a new post
export const addNewPost = createAsyncThunk(
  'commposts/addNewPost',
  async (formData, thunkAPI) => {
    try {
      const response = await axiosInstanceForm.post(
        '/api/communities/post',
        formData,
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);
export const editPost = createAsyncThunk(
  'commposts/editPost',
  async ({formData, postId}, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/api/communities/${postId}`,
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
  'commposts/deletePost',
  async (postId, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(`/api/communities/${postId}`);
      return {postId};
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const fetchPosts = createAsyncThunk(
  'commposts/fetchPosts',
  async ({page, limit = 10, userId}, thunkAPI) => {
    try {
      console.log('Fetching posts for page: ', userId);
      const response = await axiosInstance.get(
        `/api/communities/${userId}?page=${page}&limit=${limit}`,
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
  'commposts/likePost',
  async ({userId, postId}, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/api/communities/like/${postId}`,
        {
          userId,
        },
      );
      return {postId, userId};
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

export const commentOnPost = createAsyncThunk(
  'commposts/commentOnPost',
  async ({postId, userId, content}, thunkAPI) => {
    // console.log('Commented!');
    try {
      console.log({postId, userId, content});
      const response = await axiosInstance.post(
        `/api/communities/comment/${postId}`,
        {userId, content},
      );
      console.log(response.data);
      return {postId, lastComment: response.data};
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const incrementShare = createAsyncThunk(
  'commposts/incrementShare',
  async (postId, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/api/communities/share/${postId}`,
      );

      return {postId};
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

export const requestToJoinCommunity = createAsyncThunk(
  'commposts/requestToJoinCommunity',
  async ({userId, communityId}, thunkAPI) => {
    try {
      const response = await axiosInstance.put(
        `/api/communities/join/${communityId}`,
        {
          userId,
        },
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  },
);

const postsSlice = createSlice({
  name: 'commposts',
  initialState: {
    posts: [],
    totalPages: 0,
    currentPage: 1,
    loading: false,
    error: null,
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Handle the addNewPost async thunk
      .addCase(addNewPost.pending, state => {
        state.loading = true;
      })
      .addCase(addNewPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload.post); // Add new post to the start of the list
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
      .addCase(requestToJoinCommunity.fulfilled, (state, action) => {});
  },
});
export const {setPosts} = postsSlice.actions;
export default postsSlice.reducer;
