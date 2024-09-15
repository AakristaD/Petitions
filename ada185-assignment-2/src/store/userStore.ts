// userStore.ts
import { create } from 'zustand';

type User = {
    userId: number;
    token: string;
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    imageFilename: string
}
interface UserStore {
    user: User,
    setUser: (users: User) => void;
    clearUser: () => void;
}

const setLocalStorage = (key: string, value:User) => window.localStorage.setItem(key, JSON.stringify(value))
const getLocalStorage = (key: string): User => JSON.parse(window.localStorage.getItem(key) as string);

export const useStore = create<UserStore>((set) => ({
    user: getLocalStorage("user"),
    setUser: (user: User) => {
        setLocalStorage('user', user)
        return user;
    },
    clearUser: () => {
        localStorage.removeItem('user');
    },
}));

export const useUserStore = useStore;