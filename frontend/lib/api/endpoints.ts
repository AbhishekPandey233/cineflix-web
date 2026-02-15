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
    }
}