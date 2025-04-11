import { Authenticated, Unauthenticated, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "./components/ui/toaster";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold accent-text">Task Manager</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const tasks = useQuery(api.tasks.list) ?? [];
  const progress = useQuery(api.tasks.getTodayProgress) ?? { completed: 0, total: 0 };
  const createTask = useMutation(api.tasks.create);
  const completeTask = useMutation(api.tasks.complete);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskTime, setNewTaskTime] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName || !newTaskTime) return;
    await createTask({ name: newTaskName, time: newTaskTime });
    setNewTaskName("");
    setNewTaskTime("");
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold accent-text mb-4">Tasks</h1>
        <Authenticated>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-green-500"
              initial={{ width: "0%" }}
              animate={{ width: `${(progress.completed / Math.max(progress.total, 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {progress.completed} of {progress.total} tasks completed
          </p>
        </Authenticated>
        <Unauthenticated>
          <p className="text-xl text-slate-600">Sign in to manage your tasks</p>
        </Unauthenticated>
      </div>

      <Authenticated>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Task name"
            className="flex-1 rounded-lg border p-2"
          />
          <input
            type="time"
            value={newTaskTime}
            onChange={(e) => setNewTaskTime(e.target.value)}
            className="rounded-lg border p-2"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Task
          </button>
        </form>

        <div className="space-y-4">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  x: 100,
                  filter: "brightness(1.5)",
                  transition: { duration: 0.3 }
                }}
                className={`p-4 rounded-lg border shadow-sm ${
                  task.completed ? "bg-gray-50" : "bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-medium ${task.completed ? "line-through text-gray-400" : ""}`}>
                      {task.name}
                    </h3>
                    <p className="text-sm text-gray-500">{task.time}</p>
                  </div>
                  {!task.completed && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => completeTask({ taskId: task._id })}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Done
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Authenticated>

      <Unauthenticated>
        <SignInForm />
      </Unauthenticated>
    </div>
  );
}
