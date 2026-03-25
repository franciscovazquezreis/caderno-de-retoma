import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Dashboard from './features/dashboard/Dashboard';
import CreateTask from './features/tasks/CreateTask';
import EditTask from './features/tasks/EditTask';
import PauseTask from './features/snapshots/PauseTask';
import ResumeTask from './features/snapshots/ResumeTask';
import TaskHistory from './features/snapshots/TaskHistory';
import Search from './features/search/Search';
import Settings from './features/settings/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'task/new', element: <CreateTask /> },
      { path: 'task/:id/edit', element: <EditTask /> },
      { path: 'task/:id/pause', element: <PauseTask /> },
      { path: 'task/:id/resume', element: <ResumeTask /> },
      { path: 'task/:id/history', element: <TaskHistory /> },
      { path: 'search', element: <Search /> },
      { path: 'settings', element: <Settings /> }
    ]
  }
]);
