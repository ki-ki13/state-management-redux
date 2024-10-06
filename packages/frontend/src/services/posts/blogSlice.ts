import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
    BlogCreateRequest,
    BlogDeleteRequest,
    BlogModel,
    BlogResponse,
    BlogUpdateRequest,
} from "./types";
import type { RootState } from "../../store";
import type { ErrorResponse } from "../error-types";

export const blogApi = createApi({
    reducerPath: "blogApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://humble-giggle-gr7vq947rpxh96wg-4040.app.github.dev/api/",
        prepareHeaders: (headers, { getState, endpoint }) => {
            const token = (getState() as RootState).auth.token;
            console.log("Token:", token); // For debugging, remove in production
            if (token && endpoint !== "posts/all" && !endpoint.startsWith("posts/user")) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
        credentials: "include",
    }),
    refetchOnFocus: true,
    refetchOnReconnect: true,
    tagTypes: ["BlogModel"],
    endpoints: (builder) => ({
        getAllBlogPosts: builder.query<BlogModel[], void>({
            query: () => ({
                url: "posts/all",
            }),
            transformResponse: (response: { posts: BlogModel[] }) => response.posts,
            transformErrorResponse: (response) => response.data as ErrorResponse,
            providesTags: ["BlogModel"],
        }),
        getBlogPostsByUsername: builder.query<BlogModel[], string>({
            query: (user) => `posts/user/${user}`,
            transformResponse: (response: { posts: BlogModel[] }) => response.posts,
            transformErrorResponse: (response) => response.data as ErrorResponse,
            providesTags: ["BlogModel"],
        }),
        createPost: builder.mutation<BlogResponse, BlogCreateRequest>({
            query: (body) => ({
                url: "posts/post/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["BlogModel"],
            transformErrorResponse: (response) => response.data as ErrorResponse,
        }),
        deletePost: builder.mutation<BlogResponse, BlogDeleteRequest>({
            query: (body) => ({
                url: "posts/post/delete",
                method: "DELETE",
                body: { id: body.id, title: body.title },
            }),
            invalidatesTags: ["BlogModel"],
            transformErrorResponse: (response) => response.data as ErrorResponse,
        }),
        updatePost: builder.mutation<BlogResponse, BlogUpdateRequest>({
            query: (body) => ({
                url: "posts/post/update",
                method: "PUT",
                body,
            }),
            invalidatesTags: ["BlogModel"],
            transformErrorResponse: (response) => response.data as ErrorResponse,
        }),
    }),
});

export const {
    useLazyGetAllBlogPostsQuery,
    useLazyGetBlogPostsByUsernameQuery,
    useGetBlogPostsByUsernameQuery,
    useGetAllBlogPostsQuery,
    useCreatePostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
} = blogApi;