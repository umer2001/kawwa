import { useRoutes } from "react-router-dom";
import Blend from "./pages/Blend";
import Createions from "./pages/Createions";
import Createion from "./pages/Createion";
import Home from "./pages/Home";

const Router = () => {
  return useRoutes([
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/blend",
      element: <Blend />,
    },
    {
      path: "/createions",
      element: <Createions />,
    },
    {
      path: "/createion/:id",
      element: <Createion />,
    },
  ]);
};

export default Router;
