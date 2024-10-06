import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
    UserResponse,
    LoginRequest,
    LogOutResponse,
    AuthState,
    RegisterResponse,
    RegisterRequest,
    User,
} from "./types";
import type { RootState } from "../../store";

export const authBlogApi = createApi({
    reducerPath: "authBlogApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://humble-giggle-gr7vq947rpxh96wg-4040.app.github.dev/api/",
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
        credentials: "include",
    }),
    endpoints: (builder) => ({
        login: builder.mutation<UserResponse, LoginRequest>({
            query: (credentials) => ({
                url: "auth/login",
                method: "POST",
                body: credentials,
            }),
        }),
        logout: builder.mutation<LogOutResponse, void>({
            query: () => ({
                url: "auth/logout",
                method: "POST",
                validateStatus(response) {
                    return response.ok === true;
                },
            }),
        }),
        register: builder.mutation<RegisterResponse, RegisterRequest>({
            query: (info) => ({
                url: "auth/register",
                method: "POST",
                body: info,
                validateStatus(response) {
                    return response.ok === true;
                },
            }),
        }),
    }),
});

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        token: null,
    } as AuthState,
    reducers: {
        refreshAuthentication: (state) => {
            const isAuthenticated = sessionStorage.getItem("isAuthenticated");
            if (isAuthenticated === "true") {
                const userSession = sessionStorage.getItem("user");
                if (userSession) {
                    const response: UserResponse = JSON.parse(userSession);
                    state.token = response.token;
                    state.user = {
                        username: response.username,
                        id: response.userId,
                        email: response.email,
                        role: response.role,
                    };
                }
            }
        },
        setCredentials: (
            state,
            { payload: { user, token } }: PayloadAction<{ user: User; token: string }>
        ) => {
            state.user = user;
            state.token = token;
        },
    },
    extraReducers: (builder) => {
        builder.addMatcher(
            authBlogApi.endpoints.login.matchFulfilled,
            (state, { payload }) => {
                state.token = payload.token;
                state.user = {
                    id: payload.userId,
                    username: payload.username,
                    email: payload.email,
                    role: payload.role,
                };
                sessionStorage.setItem("isAuthenticated", "true");
                sessionStorage.setItem("user", JSON.stringify(payload));
            }
        );
        builder.addMatcher(authBlogApi.endpoints.logout.matchFulfilled, (state) => {
            state.token = null;
            state.user = null;
            sessionStorage.removeItem("isAuthenticated");
            sessionStorage.removeItem("user");
        });
    },
});

export const { useLoginMutation, useLogoutMutation, useRegisterMutation } = authBlogApi;
export const { refreshAuthentication, setCredentials } = authSlice.actions;
export default authSlice.reducer;