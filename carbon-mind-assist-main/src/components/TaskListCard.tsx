import { motion, AnimatePresence } from 'framer-motion';
import { TaskList, Task } from '@/types';
import { TaskItem } from './TaskItem';
import { Trash2, Circle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TaskListCardProps {
  taskList: TaskList;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteList: (listId: string) => void;
  onComplete?: () => void;
}

export const TaskListCard = ({ 
  taskList, 
  onToggleTask, 
  onDeleteTask, 
  onDeleteList,
  onComplete 
}: TaskListCardProps) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const completedTasks = taskList.tasks.filter(task => task.completed).length;
  const totalTasks = taskList.tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const isFullyCompleted = completedTasks === totalTasks && totalTasks > 0;

  useEffect(() => {
    if (isFullyCompleted && !isCompleted && !taskList.completedAt) {
      setIsCompleted(true);
      onComplete?.();
    }
  }, [isFullyCompleted, isCompleted, taskList.completedAt, onComplete]);

  return (
    <motion.div
      className={`
        bg-gradient-card border border-border rounded-lg p-5 shadow-card
        transition-all duration-300 relative
        ${isFullyCompleted ? 'border-primary shadow-focus' : ''}
      `}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-foreground mb-3">
            {taskList.title}
          </h3>
          
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
              <motion.div
                className={`h-full transition-all duration-500 ${
                  isFullyCompleted ? 'bg-primary' : 'bg-muted-foreground'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <span className={`text-xs font-medium ${
              isFullyCompleted ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {completedTasks}/{totalTasks}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-4">
          {isFullyCompleted && (
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-primary"
            >
              <Circle className="w-4 h-4 fill-current" />
            </motion.div>
          )}
          
          <motion.button
            onClick={() => onDeleteList(taskList.id)}
            className="text-muted-foreground hover:text-destructive transition-colors duration-200 p-1 hover:bg-destructive/10 rounded"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className="w-3 h-3" />
          </motion.button>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        <AnimatePresence>
          {taskList.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};