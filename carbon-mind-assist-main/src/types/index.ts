export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export interface TaskList {
  id: string;
  title: string;
  tasks: Task[];
  createdAt: Date;
  completedAt?: Date;
}

export interface UserProgress {
  level: number;
  experience: number;
  experienceToNext: number;
  completedTaskLists: number;
}

export interface AppState {
  activeTab: 'notes' | 'chat';
  taskLists: TaskList[];
  userProgress: UserProgress;
}