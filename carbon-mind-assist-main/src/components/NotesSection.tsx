import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { TaskList, Task, UserProgress } from '@/types';
import { TaskListCard } from './TaskListCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface NotesSectionProps {
  taskLists: TaskList[];
  userProgress: UserProgress;
  onCreateTaskList: (title: string, tasks: string[]) => void;
  onToggleTask: (listId: string, taskId: string) => void;
  onDeleteTask: (listId: string, taskId: string) => void;
  onDeleteList: (listId: string) => void;
  onTaskListComplete: (listId: string) => void;
}

export const NotesSection = ({
  taskLists,
  userProgress,
  onCreateTaskList,
  onToggleTask,
  onDeleteTask,
  onDeleteList,
  onTaskListComplete,
}: NotesSectionProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newTasks, setNewTasks] = useState<string[]>(['']);

  const handleCreateList = () => {
    if (newListTitle.trim() && newTasks.some(task => task.trim())) {
      const validTasks = newTasks.filter(task => task.trim());
      onCreateTaskList(newListTitle.trim(), validTasks);
      setNewListTitle('');
      setNewTasks(['']);
      setIsCreateOpen(false);
    }
  };

  const addTaskField = () => {
    setNewTasks([...newTasks, '']);
  };

  const updateTask = (index: number, value: string) => {
    const updated = [...newTasks];
    updated[index] = value;
    setNewTasks(updated);
  };

  const removeTask = (index: number) => {
    if (newTasks.length > 1) {
      const updated = newTasks.filter((_, i) => i !== index);
      setNewTasks(updated);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">NOTES</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {taskLists.length} lists • {userProgress.completedTaskLists} completed
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-4 py-2 h-9"
              >
                <Plus className="w-4 h-4 mr-2" />
                CREATE
              </Button>
            </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Task List</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  List Title
                </label>
                <Input
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="Enter list title..."
                  className="bg-secondary border-border"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Tasks
                </label>
                <div className="space-y-2">
                  <AnimatePresence>
                    {newTasks.map((task, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2"
                      >
                        <Input
                          value={task}
                          onChange={(e) => updateTask(index, e.target.value)}
                          placeholder={`Task ${index + 1}...`}
                          className="bg-secondary border-border"
                        />
                        {newTasks.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeTask(index)}
                            className="px-2"
                          >
                            ×
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTaskField}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateList}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!newListTitle.trim() || !newTasks.some(task => task.trim())}
                >
                  Create List
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Lists */}
      <div className="grid gap-6">
        <AnimatePresence>
          {taskLists.map((taskList) => (
            <TaskListCard
              key={taskList.id}
              taskList={taskList}
              onToggleTask={(taskId) => onToggleTask(taskList.id, taskId)}
              onDeleteTask={(taskId) => onDeleteTask(taskList.id, taskId)}
              onDeleteList={() => onDeleteList(taskList.id)}
              onComplete={() => onTaskListComplete(taskList.id)}
            />
          ))}
        </AnimatePresence>

        {taskLists.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No task lists yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first task list to get started with organizing your thoughts
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First List
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};