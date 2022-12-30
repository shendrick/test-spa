import {
  Outlet,
  RouterProvider,
  Link,
  createReactRouter,
  createRouteConfig,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const rootRoute = createRouteConfig({
  // path: "test-spa",
  component: () => (
    <>
      <Banner />
      <div>
        <Link to="/">Home</Link> <Link to="/about">About</Link>
      </div>
      <hr />
      <Outlet />
    </>
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
    setShowReload(false);
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

    // document.onvisibilitychange = (e) => {
    //   serviceWorkerRegistration.forceSWupdate();
    // };
  }, []);

  return (
    <>
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
  return <RouterProvider router={router} />;
}

function Index() {
  return (
    <div>
      <h3>Welcome Home 1!</h3>
    </div>
  );
}

function About() {
  return <div>Hello from About!</div>;
}
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();

export default App;
