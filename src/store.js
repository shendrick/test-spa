import { createContext, useState, useContext, useEffect } from "react";
import { LiquorStore } from "liquorstore";
import _get from "lodash/get";
import localforage from "localforage";

export class Store extends LiquorStore {
  testSelector = () => {
    const { state } = this;
    return state.test;
  };
  testMutate = (value) => {
    this.mutate((s) => {
      s.test = value;
    });
  };
}

const INITIAL_STATE = {
  test: "",
};

// React stuff

export const storeContext = createContext();

// export const useStoreInitializer = (stored = null) => {
//   const data = stored ? stored : INITIAL_STATE;
//   const [store, setStore] = useState();
//   useEffect(() => {
//     if (data && !store) {
//       console.log("setStore!", data, store);
//       setStore(() => new Store(data));
//     }
//   }, [data]);

//   return store;
// };

export const useStoreDetail = (path) => {
  const store = useStoreContext();
  const value = store.useStaticSelector((s) => {
    // console.log("defaultText!", _get(s, path));
    return _get(s, path);
  });
  return value;
};

export const useDataLoader = (fileData) => {
  const [store, setStore] = useState();
  useEffect(() => {
    localforage.getItem("store", (err, stored) => {
      if (err) {
        console.log("localforage error!", err);
      }
      setStore(() => {
        return new Store(stored ? stored : INITIAL_STATE);
      });
    });
  }, []);

  return store;
};

export const useStoreContext = () => useContext(storeContext);
