import {
  Outlet,
  RouterProvider,
  Link,
  createReactRouter,
  createRouteConfig,
} from "@tanstack/react-router";

const rootRoute = createRouteConfig({
  // path: "test-spa",
  component: () => (
    <>
      <div>
        <Link to="/test-spa">Home</Link> <Link to="/test-spa/about">About</Link>
      </div>
      <hr />
      <Outlet />
    </>
  ),
});

const indexRoute = rootRoute.createRoute({
  path: "/",
  // component: Index,
});

const baseRoute = rootRoute.createRoute({
  path: "/test-spa",
  // component: Index,
});

const baseIndexRoute = baseRoute.createRoute({
  path: "/",
  component: Index,
});
const baseAboutRoute = baseRoute.createRoute({
  path: "/about",
  component: About,
});

const routeConfig = rootRoute.addChildren([
  indexRoute,
  baseRoute.addChildren([baseIndexRoute, baseAboutRoute]),
]);

const router = createReactRouter({ routeConfig });

function App() {
  return <RouterProvider router={router} />;
}

function Index() {
  return (
    <div>
      <h3>Welcome Home1!</h3>
    </div>
  );
}

function About() {
  return <div>Hello from About2!</div>;
}

export default App;
