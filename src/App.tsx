import { RouterProvider } from 'react-router';
import { router } from './route/routes';
import { MobileBlock } from './components/common/MobileBlock';

export default function App() {
  return (
    <MobileBlock>
      <RouterProvider router={router} />
    </MobileBlock>
  );
}
