import {
  Outlet,
  RouterProvider,
  Link,
  createReactRouter,
  createRouteConfig,
} from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

import preval from "preval.macro";
import { storeContext, useDataLoader, useStoreContext } from "./store";
import localforage from "localforage";
import _get from "lodash/get";
import _set from "lodash/set";
import { fileOpen, fileSave } from "browser-fs-access";

const Controls = () => {
  const store = useStoreContext();

  // const { remount } = useRemount();

  const canUndo = store.useCanUndo();
  const canRedo = store.useCanRedo();

  const handleUndoClick = () => {
    store.undo();
  };

  const handleRedoClick = () => {
    store.redo();
  };

  const [hasStored, setHasStored] = useState(false);

  const [importedBlob, setImportedBlob] = useState();

  useEffect(() => {
    localforage.getItem("store", (err, stored) => {
      console.log("store!", stored);
      setHasStored(!!stored);
    });
  }, []);

  const handleSaveClick = () => {
    console.log(store.current);
    setHasStored(true);
    localforage.setItem("store", store.current);
  };

  const handleReloadClick = () => {
    window && window.location.reload();
  };

  const handleNewClick = () => {
    localforage.removeItem("store").then(() => {
      window && window.location.reload();
    });
  };

  const handleImportClick = async () => {
    const blob = await fileOpen({
      mimeTypes: ["application/json"],
    });
    const text = await new Response(blob).text();
    const imported = JSON.parse(text);
    localforage.setItem("store", imported, () => {
      setImportedBlob(blob);
      window && window.location.reload();
    });
  };

  const handleExportClick = () => {
    localforage.getItem("store").then(async (stored) => {
      const blob = new Blob([JSON.stringify(stored, null, 2)], {
        type: "application/json",
      });
      // const sanitizedTitle = sanitize(`${stored.title}`).replace(/ /g, "_");

      await fileSave(blob, {
        fileName: `store.json`,
        extensions: [".json"],
      });
      //   setHasStored(false);
      // window.location.reload();
    });
  };

  return (
    <div>
      <button type="button" onClick={handleNewClick}>
        New
      </button>
      &nbsp; | &nbsp;
      <button type="button" disabled={!canUndo} onClick={handleUndoClick}>
        Undo
      </button>
      <button type="button" disabled={!canRedo} onClick={handleRedoClick}>
        Redo
      </button>
      &nbsp; | &nbsp;
      <button type="button" onClick={handleSaveClick}>
        Save
      </button>
      <button type="button" onClick={handleReloadClick} disabled={!hasStored}>
        Reload
      </button>
      &nbsp; | &nbsp;
      <button onClick={handleImportClick}>Import</button>
      <button
        onClick={handleExportClick}
        disabled={!canUndo && !canRedo && !hasStored}
      >
        Export
      </button>
      <hr />
    </div>
  );
};

const rootRoute = createRouteConfig({
  component: () => (
    <div>
      <Banner />
      <Controls />
      <div>
        <Link to="/">Home</Link> <Link to="/about">About</Link>
      </div>
      <hr />
      <Outlet />
    </div>
  ),
});

const Banner = () => {
  const [showReload, setShowReload] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  const onSWUpdate = (registration) => {
    setShowReload(true);
    setWaitingWorker(registration.waiting);
    console.log("onUpdate!");
  };
  const onSWSuccess = (registration) => {
    console.log("onSuccess!");
    setShowSuccess(true);
  };
  const reloadPage = () => {
    waitingWorker?.postMessage({ type: "SKIP_WAITING" });
    // setShowReload(false);
    window.location.reload(true);
  };

  useEffect(() => {
    // If you want your app to work offline and load faster, you can change
    // unregister() to register() below. Note this comes with some pitfalls.
    // Learn more about service workers: https://cra.link/PWA
    serviceWorkerRegistration.register({
      onUpdate: onSWUpdate,
      onSuccess: onSWSuccess,
    });

    document.addEventListener("visibilitychange", () => {
      const state = document.visibilityState;
      // if (state === "hidden") {
      //   // your PWA is now in the background
      // }

      if (state === "visible") {
        // your PWA is now in the foreground
        // refreshData();
        serviceWorkerRegistration.forceSWupdate();
      }
      // setVisibility(document.visibilityState);
    });
    // document.onvisibilitychange = (e) => {
    //   serviceWorkerRegistration.forceSWupdate();
    // };
  }, []);

  return (
    <>
      {/* {visibility ? <div>Visibility: {visibility}</div> : null} */}
      {showReload ? (
        <div>
          Update available.{" "}
          <button type="button" onClick={reloadPage}>
            Reload!
          </button>
          <hr />
        </div>
      ) : null}
      {showSuccess ? (
        <div>
          Available offline!
          <hr />
        </div>
      ) : null}
    </>
  );
};

const indexRoute = rootRoute.createRoute({
  path: "/",
  component: Index,
});

const aboutRoute = rootRoute.createRoute({
  path: "/about",
  component: About,
});

const routeConfig = rootRoute.addChildren([indexRoute, aboutRoute]);

const router = createReactRouter({ routeConfig });

function App() {
  const store = useDataLoader();
  // const store = useStoreInitializer(data);
  console.log("store initializer!", store);
  return store ? (
    <storeContext.Provider value={store}>
      <RouterProvider router={router} />
    </storeContext.Provider>
  ) : null;
}

const buildDateTimeISO = preval`module.exports = new Date().toISOString()`;
const buildTime = new Date(buildDateTimeISO);

const timeAgo = ({ time, current = new Date(), forceSeconds }) => {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - time;

  if (elapsed < msPerMinute || forceSeconds) {
    return {
      number: Math.round(elapsed / 1000),
      type: "seconds",
      interval: 1000,
    };
  } else if (elapsed < msPerHour) {
    return {
      number: Math.round(elapsed / msPerMinute),
      type: "minutes",
      interval: msPerMinute,
    };
  } else if (elapsed < msPerDay) {
    return {
      number: Math.round(elapsed / msPerHour),
      type: "hours",
      interval: msPerHour,
    };
  } else if (elapsed < msPerMonth) {
    return {
      number: Math.round(elapsed / msPerDay),
      type: "days",
      interval: msPerDay,
    };
  } else if (elapsed < msPerYear) {
    return {
      number: Math.round(elapsed / msPerMonth),
      type: "months",
      interval: msPerMonth,
    };
  } else {
    return {
      number: Math.round(elapsed / msPerYear),
      type: "years",
      interval: msPerYear,
    };
  }
};

const useTimeAgo = ({ time, current, forceSeconds }) => {
  const [currentTimeAgo, setCurrentTimeAgo] = useState();
  const { interval } = timeAgo({ time, current, forceSeconds });
  useEffect(() => {
    if (!currentTimeAgo) {
      const { number, type } = timeAgo({ time, current, forceSeconds });
      setCurrentTimeAgo(`${number} ${type} ago`);
    }
    const agoInterval = setInterval(() => {
      const { number, type } = timeAgo({ time, current, forceSeconds });

      setCurrentTimeAgo(`${number} ${type} ago`);
    }, interval);
    return () => {
      clearInterval(agoInterval);
    };
  }, [interval, time, current, forceSeconds]);
  return currentTimeAgo;
};

const TimeAgo = () => {
  const buildTimeAgo = useTimeAgo({ time: buildTime });
  return <div>built: {buildTimeAgo}</div>;
};

function Index() {
  const store = useStoreContext();
  const test = store.useStaticSelector((s) => s.test);
  return (
    <div>
      <h3>Welcome Home!</h3>
      <ul>
        <li>test: {test}</li>
        <li>
          <TimeAgo />
        </li>
        <li>env: {process.env.NODE_ENV}</li>
      </ul>
    </div>
  );
}

function About() {
  const store = useStoreContext();
  const path = "test";

  const initialValue = store.useStaticSelector((s) => {
    // console.log("defaultText!", _get(s, path));
    return _get(s, path);
  });

  const [value, setValue] = useState(initialValue);

  // console.log("TextField render!", text);

  const handleInputBlur = useCallback(
    (ev) => {
      store.mutate((state) => {
        const currentValue = _get(state, path);
        if (currentValue !== ev.currentTarget.value) {
          _set(state, path, ev.currentTarget.value);
        }
      });
    },
    [store]
  );

  const handleInputChange = useCallback(
    (ev) => {
      // console.log("textChange!", ev.currentTarget.value, text);
      setValue(ev.currentTarget.value);
    },
    [store]
  );

  useEffect(() => {
    // console.log("useEffect!", defaultText, text);
    setValue(initialValue);
  }, [initialValue]);

  return (
    <div>
      <label>Test: </label>
      <input
        style={{ fontSize: "16px" }}
        type="text"
        onBlur={handleInputBlur}
        onChange={handleInputChange}
        value={value}
      />
    </div>
  );
}
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

export default App;
