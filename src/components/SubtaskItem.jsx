import React, { memo, useCallback, useState } from "react";
import { StickyNote, Trash2, Download, Users } from "lucide-react";
import axios from "axios";

const SubtaskItem = memo(
  ({ sub, task, setSubtaskToDelete, setIsDeleteModalOpen, setTasks }) => {
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [noteInput, setNoteInput] = useState("");

    const handleSaveNote = useCallback(
      async (taskId, subtaskId) => {
        try {
          await axios.put(
            `http://localhost:5001/api/tasks/${taskId}/subtasks/${subtaskId}`,
            { note: noteInput }
          );
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task._id === taskId
                ? {
                    ...task,
                    subtasks: task.subtasks.map((sub) =>
                      sub._id === subtaskId ? { ...sub, note: noteInput } : sub
                    ),
                  }
                : task
            )
          );
          setEditingNoteId(null);
          setNoteInput("");
        } catch (error) {
          console.error("Error saving note:", error);
        }
      },
      [noteInput]
    );
    console.log(sub, task);

    return (
      <div className="bg-gray-50 p-3 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">{sub.title}</span>
          <div className="flex space-x-2">
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => {
                setEditingNoteId(sub._id === editingNoteId ? null : sub._id);
                setNoteInput(sub.note || "");
              }}
              aria-label="Edit Note"
            >
              <StickyNote className="w-5 h-5" />
            </button>
            <button
              className="text-gray-500 hover:text-red-500"
              onClick={() => {
                setSubtaskToDelete({
                  taskId: task._id,
                  subtaskId: sub._id,
                });
                setIsDeleteModalOpen(true);
              }}
              aria-label="Delete Subtask"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => downloadSubtask(sub)}
              aria-label="Download Subtask"
            >
              <Download className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-1">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-sm">{sub.assignees?.length || 0}</span>
            </div>
          </div>
        </div>

        {editingNoteId === sub._id && (
          <div className="mt-2">
            <input
              type="text"
              placeholder="Write a note..."
              className="w-full px-2 py-1 border rounded"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
            />
            <button
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              onClick={() => handleSaveNote(task._id, sub._id)}
            >
              Save
            </button>
          </div>
        )}

        {sub.note && !editingNoteId && (
          <p className="text-sm text-gray-600 mt-2">📝 {sub.note}</p>
        )}
      </div>
    );
  }
);

export default SubtaskItem;
