import { useRoutes } from 'react-router-dom';
import Blend from './pages/Blend';
import Createions from './pages/Createions';
import Createion from './pages/Createion';

const Router = () => {
    return useRoutes([
        {
            path: '/',
            element: <h1>Home</h1>
        },
        {
            path: '/blend',
            element: <Blend />
        },
        {
            path: '/createions',
            element: <Createions />

        },
        {
            path: '/createion/:id',
            element: <Createion />
        }
    ]);
}

export default Router;