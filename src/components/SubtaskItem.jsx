import React, { memo, useCallback, useState } from "react";
import { Trash2, Download, Users, Pencil } from "lucide-react";
import axios from "axios";

const SubtaskItem = memo(
  ({ sub, task, setSubtaskToDelete, setIsDeleteModalOpen, setTasks }) => {
    const [editingSubtaskId, setEditingSubtaskId] = useState(null);
    const [noteInput, setNoteInput] = useState(sub.note || "");
    const [startDate, setStartDate] = useState(sub.startDate || "");
    const [endDate, setEndDate] = useState(sub.endDate || "");

    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toISOString().split("T")[0];
    };

    const handleSaveSubtask = useCallback(
      async (taskId, subtaskId) => {
        try {
          await axios.put(
            `${
              import.meta.env.VITE_API_URL
            }/api/tasks/${taskId}/subtasks/${subtaskId}`,
            {
              note: noteInput,
              startDate,
              endDate,
            }
          );

          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task._id === taskId
                ? {
                    ...task,
                    subtasks: task.subtasks.map((sub) =>
                      sub._id === subtaskId
                        ? { ...sub, note: noteInput, startDate, endDate }
                        : sub
                    ),
                  }
                : task
            )
          );

          setEditingSubtaskId(null);
        } catch (error) {
          console.error("Error saving subtask:", error);
        }
      },
      [noteInput, startDate, endDate]
    );

    return (
      <div className="p-3 rounded-lg shadow-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
        <div className="flex justify-between items-center">
          <span className="font-medium">{sub.title}</span>
          <div className="flex space-x-2">
            <button
              className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
              onClick={() =>
                setEditingSubtaskId(
                  sub._id === editingSubtaskId ? null : sub._id
                )
              }
              aria-label="Edit Subtask"
            >
              <Pencil className="w-5 h-5" />
            </button>
            <button
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-600"
              onClick={() => {
                setSubtaskToDelete({ taskId: task._id, subtaskId: sub._id });
                setIsDeleteModalOpen(true);
              }}
              aria-label="Delete Subtask"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white"
              onClick={() => downloadSubtask(sub)}
              aria-label="Download Subtask"
            >
              <Download className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-1">
              <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm">{sub.assignees?.length || 0}</span>
            </div>
          </div>
        </div>

        {editingSubtaskId === sub._id && (
          <div className="mt-2 bg-gray-200 dark:bg-gray-900 p-2 rounded">
            <label className="block text-gray-700 dark:text-gray-300">
              Note:
            </label>
            <input
              type="text"
              placeholder="Write a note..."
              className="w-full px-2 py-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
            />

            <label className="block text-gray-700 dark:text-gray-300 mt-2">
              Start Date:
            </label>
            <input
              type="date"
              className="w-full px-2 py-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <label className="block text-gray-700 dark:text-gray-300 mt-2">
              End Date:
            </label>
            <input
              type="date"
              className="w-full px-2 py-1 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            <button
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              onClick={() => handleSaveSubtask(task._id, sub._id)}
            >
              Save
            </button>
          </div>
        )}

        {!editingSubtaskId && (
          <div className="mt-2 text-gray-700 dark:text-gray-400">
            {sub.note && <p>📝 {sub.note}</p>}
            {sub.startDate && <p>📅 Start Date: {formatDate(sub.startDate)}</p>}
            {sub.endDate && <p>📅 End Date: {formatDate(sub.endDate)}</p>}
          </div>
        )}
      </div>
    );
  }
);

export default SubtaskItem;
