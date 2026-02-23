//backend routes
export const API = {
    AUTH: {
        REGISTER: "/api/auth/register",
        LOGIN: "/api/auth/login",
        FORGOT_PASSWORD: "/api/auth/forgot-password",
        RESET_PASSWORD: "/api/auth/reset-password",
    },
    MOVIES: {
        ALL: "/api/movies",
        NOW_SHOWING: "/api/movies/now-showing",
        COMING_SOON: "/api/movies/coming-soon",
        DETAILS: (id: string | number) => `/api/movies/${id}`,
    },
    SHOWTIMES: {
        BY_MOVIE: (movieId: string | number) => `/api/showtimes/movie/${movieId}`,
    },
    BOOKINGS: {
        SEAT_AVAILABILITY: (showtimeId: string | number) => `/api/showtimes/${showtimeId}/seats`,
        CREATE: "/api/bookings",
        USER_HISTORY: "/api/bookings/user/history",
        CANCEL: (bookingId: string | number) => `/api/bookings/${bookingId}`,
        KHALTI_INITIATE: (bookingId: string | number) => `/api/bookings/${bookingId}/payment/khalti/initiate`,
        KHALTI_VERIFY: (bookingId: string | number) => `/api/bookings/${bookingId}/payment/khalti/verify`,
    },
    ADMIN: {
        MOVIES: {
            ALL: "/api/admin/movies",
            DETAILS: (id: string | number) => `/api/admin/movies/${id}`,
        },
        SHOWTIMES: {
            BY_MOVIE: (movieId: string | number) => `/api/admin/showtimes/movie/${movieId}`,
            DETAILS: (id: string | number) => `/api/admin/showtimes/${id}`,
            CREATE: "/api/admin/showtimes",
        },
        BOOKINGS: {
            ALL: "/api/admin/bookings",
            CANCEL: (bookingId: string | number) => `/api/admin/bookings/${bookingId}`,
        },
    },
}