import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import SubtaskModal from "./SubtaskModal";
import DeleteModal from "./DeleteModal";
import TaskCard from "./TaskCard";
import { useNavigate } from "react-router-dom";

export function TaskBoard({ initialTasks = [] }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isSubtaskModalOpen, setIsSubtaskModalOpen] = useState(false);
  const [subtaskToDelete, setSubtaskToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTasks(initialTasks);
    initialTasks.forEach((task) => fetchSubtasks(task._id));
  }, [initialTasks]);

  const fetchSubtasks = useCallback(async (taskId) => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tasks/${taskId}/subtasks`
      );
      const fetchedSubtasks = response.data || [];
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, subtasks: fetchedSubtasks } : task
        )
      );
    } catch (error) {
      console.error("Error fetching subtasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddSubtask = useCallback(async (taskId, newSubtask) => {
    if (!taskId) return;
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tasks/${taskId}/subtasks`,
        newSubtask,
        { headers: { "Content-Type": "application/json" } }
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId
            ? { ...task, subtasks: [...(task.subtasks || []), response.data] }
            : task
        )
      );
    } catch (error) {
      console.error("Error adding subtask:", error);
    }
  }, []);

  const confirmDeleteSubtask = useCallback(async () => {
    if (!subtaskToDelete) return;
    const { taskId, subtaskId } = subtaskToDelete;
    try {
      await axios.delete(
        `${
          import.meta.env.VITE_API_URL
        }/api/tasks/${taskId}/subtasks/${subtaskId}`
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId
            ? {
                ...task,
                subtasks: task.subtasks.filter((sub) => sub._id !== subtaskId),
              }
            : task
        )
      );
    } catch (error) {
      console.error("Error deleting subtask:", error);
    }
    setIsDeleteModalOpen(false);
    setSubtaskToDelete(null);
  }, [subtaskToDelete]);

  const filteredTasks = tasks.map((task) => ({
    ...task,
    subtasks:
      task.subtasks?.filter((sub) =>
        sub.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) ?? [],
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-6 transition-colors">
      {/* Search Bar */}
      <div className="mb-6 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search subtasks..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {/* Task Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            setTasks={setTasks}
            setSelectedTask={setSelectedTask}
            setIsSubtaskModalOpen={setIsSubtaskModalOpen}
            navigate={navigate}
            setSubtaskToDelete={setSubtaskToDelete}
            setIsDeleteModalOpen={setIsDeleteModalOpen}
          />
        ))}
      </div>

      {/* Subtask Modal */}
      {isSubtaskModalOpen && selectedTask && (
        <SubtaskModal
          task={selectedTask}
          onClose={() => setIsSubtaskModalOpen(false)}
          onSave={handleAddSubtask}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteModal
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDeleteSubtask}
        />
      )}
    </div>
  );
}
