import { create } from "zustand";
import _ from "lodash";
import {immer} from "zustand/middleware/immer";
import store from "store2";
import {STORE_COLOR_MODE} from "../constants";

const toggleColorMode = _.debounce((colorMode, cb) => {
  const htmlElement = document.querySelector('html');
  htmlElement.setAttribute('data-bs-theme', colorMode);
  cb();
});

export const useColorMode = create(immer((set) => ({
  colorMode: "light",
  setColorMode: (colorMode) => {
    toggleColorMode(colorMode, () => {
      set({ colorMode });
      store.set(STORE_COLOR_MODE, colorMode);
    });
  },
})));

export const useIsDarkMode = () => {
  const colorMode = useColorMode(state => state.colorMode);
  return colorMode === "dark";
};