import store from 'store2';
import { create } from "zustand";
import {immer} from "zustand/middleware/immer";
import {STORE_TOKEN} from "../constants";

export const useAuthStore = create(immer((set) => ({
  auth: null,
  initialized: false,
  token: store.get(STORE_TOKEN, null),
  setInitialized: () => {
    set({
      initialized: true,
    });
  },
  setToken: (token) => {
    set({ token });
    store.set(STORE_TOKEN, token);
  },
  setUser: (user) => {
    set({ auth: user });
  },
  logout: () => {
    store.remove(STORE_TOKEN);
    set({ auth: null, token: null });
  }
})));