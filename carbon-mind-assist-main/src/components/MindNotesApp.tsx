import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppState, TaskList, Task, UserProgress } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { addExperience, getExperienceForTaskListCompletion } from '@/utils/levelSystem';
import { Sidebar } from './Sidebar';
import { LevelIndicator } from './LevelIndicator';
import { NotesSection } from './NotesSection';
import { ChatSection } from './ChatSection';

const initialUserProgress: UserProgress = {
  level: 0,
  experience: 0,
  experienceToNext: 100,
  completedTaskLists: 0,
};

export const MindNotesApp = () => {
  const [appState, setAppState] = useLocalStorage<AppState>('mindnotes-state', {
    activeTab: 'notes',
    taskLists: [],
    userProgress: initialUserProgress,
  });
  
  const [showLevelUp, setShowLevelUp] = useState(false);

  const handleTabChange = (tab: AppState['activeTab']) => {
    setAppState(prev => ({ ...prev, activeTab: tab }));
  };

  const createTaskList = (title: string, taskTexts: string[]) => {
    const tasks: Task[] = taskTexts.map(text => ({
      id: `task-${Date.now()}-${Math.random()}`,
      text,
      completed: false,
      createdAt: new Date(),
    }));

    const newTaskList: TaskList = {
      id: `list-${Date.now()}`,
      title,
      tasks,
      createdAt: new Date(),
    };

    setAppState(prev => ({
      ...prev,
      taskLists: [newTaskList, ...prev.taskLists],
    }));
  };

  const toggleTask = (listId: string, taskId: string) => {
    setAppState(prev => ({
      ...prev,
      taskLists: prev.taskLists.map(list =>
        list.id === listId
          ? {
              ...list,
              tasks: list.tasks.map(task =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task
              ),
            }
          : list
      ),
    }));
  };

  const deleteTask = (listId: string, taskId: string) => {
    setAppState(prev => ({
      ...prev,
      taskLists: prev.taskLists.map(list =>
        list.id === listId
          ? {
              ...list,
              tasks: list.tasks.filter(task => task.id !== taskId),
            }
          : list
      ),
    }));
  };

  const deleteTaskList = (listId: string) => {
    setAppState(prev => ({
      ...prev,
      taskLists: prev.taskLists.filter(list => list.id !== listId),
    }));
  };

  const completeTaskList = (listId: string) => {
    const taskList = appState.taskLists.find(list => list.id === listId);
    if (!taskList || taskList.completedAt) return;

    const xpGained = getExperienceForTaskListCompletion(taskList.tasks.length);
    const previousLevel = appState.userProgress.level;
    const newProgress = addExperience(appState.userProgress, xpGained);
    
    setAppState(prev => ({
      ...prev,
      taskLists: prev.taskLists.map(list =>
        list.id === listId
          ? { ...list, completedAt: new Date() }
          : list
      ),
      userProgress: {
        ...newProgress,
        completedTaskLists: prev.userProgress.completedTaskLists + 1,
      },
    }));

    // Show level up animation if leveled up
    if (newProgress.level > previousLevel) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 3000);
    }
  };

  const createTaskListFromAI = (title: string, tasks: string[]) => {
    createTaskList(title, tasks);
    // Switch to notes tab to show the created list
    setAppState(prev => ({ ...prev, activeTab: 'notes' }));
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        activeTab={appState.activeTab} 
        onTabChange={handleTabChange} 
      />
      
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-14 bg-gradient-main border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-base font-semibold text-foreground uppercase tracking-wide">
              {appState.activeTab === 'notes' ? 'NOTES' : 'AI CHAT'}
            </h1>
          </div>
          
          <LevelIndicator 
            userProgress={appState.userProgress} 
            showLevelUp={showLevelUp}
          />
        </div>

        {/* Main Content */}
        <motion.div 
          className="flex-1 overflow-hidden"
          key={appState.activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {appState.activeTab === 'notes' ? (
            <NotesSection
              taskLists={appState.taskLists}
              userProgress={appState.userProgress}
              onCreateTaskList={createTaskList}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onDeleteList={deleteTaskList}
              onTaskListComplete={completeTaskList}
            />
          ) : (
            <ChatSection onCreateTaskListFromAI={createTaskListFromAI} />
          )}
        </motion.div>
      </div>
    </div>
  );
};