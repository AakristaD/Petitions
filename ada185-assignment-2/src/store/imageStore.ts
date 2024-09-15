import { create } from 'zustand';

interface ImageStore {
    image: File | null;
    setImage: (image: File | null) => void;
    clearImage: () => void;
}

const setLocalStorage = (key: string, value: File | null) => {
    if (value) {
        localStorage.setItem(key, JSON.stringify(value));
    } else {
        localStorage.removeItem(key);
    }
};

const getLocalStorage = (key: string): File | null => {
    const item = localStorage.getItem(key);
    if (item) {
        const fileData = JSON.parse(item);
        const file = new File([fileData], fileData.name, { type: fileData.type });
        return file;
    }
    return null;
};

export const useImageStore = create<ImageStore>((set) => ({
    image: getLocalStorage('image'),
    setImage: (image) => {
        setLocalStorage('image', image);
        set({ image });
    },
    clearImage: () => {
        localStorage.removeItem('image');
        set({ image: null });
    },
}));

