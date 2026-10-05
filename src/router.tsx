import { createHashRouter, Navigate } from 'react-router'
import { App } from './App'
import { GoalsPage } from './features/goals/GoalsPage'
import { HabitsPage } from './features/habits/HabitsPage'
import { ProfilePage } from './features/profile/ProfilePage'
import { TasksPage } from './features/tasks/TasksPage'
import { TodayPage } from './features/today/TodayPage'

export const router = createHashRouter([
  {
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/today" replace /> },
      { path: 'today', element: <TodayPage /> },
      { path: 'habits', element: <HabitsPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'you', element: <ProfilePage /> },
    ],
  },
])
