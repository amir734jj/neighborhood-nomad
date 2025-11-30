import {create} from "zustand";
import {immer} from 'zustand/middleware/immer';
import {produce} from "immer";

export const useGlobalConfig = create(immer((set) => ({
  initialized: false,
  initializedPublicGlobalConfig: false,
  globalConfig: {},
  publicGlobalConfig: {},
  setGlobalConfig: (globalConfig) => {
    set(produce(state => {
      state.globalConfig = globalConfig;
    }));
  },
  setInitialized: (initialized) => {
    set(produce(state => {
      state.initialized = initialized;
    }));
  },
  setInitializedPublicGlobalConfig: (initializedPublicGlobalConfig) => {
    set(produce(state => {
      state.initializedPublicGlobalConfig = initializedPublicGlobalConfig;
    }));
  },
  setPublicGlobalConfig: (publicGlobalConfig) => {
    set(produce(state => {
      state.publicGlobalConfig = publicGlobalConfig;
    }));
  },
})));