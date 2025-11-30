import { create } from "zustand";
import {immer} from "zustand/middleware/immer";
import store from "store2";
import {STORE_THEME} from "../constants";
import {produce} from "immer";

export const useThemeSelector = create(immer((set, getState) => ({
  theme: "flatly",
  themes: [
    "default",
    "cerulean",
    "cosmo",
    "cyborg",
    "darkly",
    "flatly",
    "journal",
    "litera",
    "lumen",
    "lux",
    "materia",
    "minty",
    "morph",
    "pulse",
    "quartz",
    "sandstone",
    "simplex",
    "sketchy",
    "slate",
    "solar",
    "spacelab",
    "superhero",
    "united",
    "vapor",
    "yeti",
    "zephyr"
  ],
  setTheme: (theme) => {
    set(produce(state => {
      state.theme = theme;
    }));

    store.set(STORE_THEME, theme);
  }
})));