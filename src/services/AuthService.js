const TOKEN_KEY = "@LibMusical:token";
const USER_KEY = "@LibMusical:user";

export const saveSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getUser = () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
};

export const getUserId = () => {
    const user = getUser();
    return user ? user.id : null;
};

export const isAuthenticated = () => !!getToken();

export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};