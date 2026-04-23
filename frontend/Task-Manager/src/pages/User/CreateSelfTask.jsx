import React, { useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { PRIORITY_DATA } from "../../utils/data";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import AddAttachmentsInput from "../../components/Inputs/AddAttachmentsInput";

const CreateSelfTask = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [dueDate, setDueDate] = useState("");
  const [todoChecklist, setTodoChecklist] = useState([{ text: "", completed: false }]);
  const [attachments, setAttachments] = useState([]);
  const navigate = useNavigate();
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "Low",
    dueDate: null,
    todoChecklist: [],
    attachments: [],  // <-- Important
  });


  const handleChecklistChange = (index, field, value) => {
    const newChecklist = [...todoChecklist];
    newChecklist[index][field] = value;
    setTodoChecklist(newChecklist);
  };

  const addChecklistItem = () => {
    setTodoChecklist([...todoChecklist, { text: "", completed: false }]);
  };

  const removeChecklistItem = (index) => {
    const newChecklist = [...todoChecklist];
    newChecklist.splice(index, 1);
    setTodoChecklist(newChecklist);
  };

  const handleFileChange = (e) => {
    setAttachments([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("priority", priority);
      formData.append("dueDate", dueDate);
      formData.append("createdBySelf", true);
      todoChecklist.forEach((item, index) => {
        formData.append(`todoChecklist[${index}][text]`, item.text);
        formData.append(`todoChecklist[${index}][completed]`, item.completed);
      });
      attachments.forEach((file) => formData.append("attachments", file));

      await axiosInstance.post(API_PATHS.TASKS.CREATE_SELF_TASKS, formData);

      toast.success("Self task created successfully!");
      navigate("/user/tasks");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    }
  };

  return (
    <DashboardLayout activeMenu="Self Tasks">
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Create Self Task</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="form-input w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-slate-600">Description</label>
            <textarea
              placeholder='Describe Task'
              className="form-input w-full"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Priority and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                className="form-input w-full"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITY_DATA.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input
                type="date"
                className="form-input w-full"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={moment().format("YYYY-MM-DD")}
                required
              />
            </div>
          </div>

          {/* Checklist */}
          <div>
            <label className="text-xs font-medium text-slate-600">Checklist</label>
            {todoChecklist.map((item, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  className="form-input flex-1"
                  placeholder="Task item"
                  value={item.text}
                  onChange={(e) => handleChecklistChange(index, "text", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeChecklistItem(index)}
                  className="text-red-500 text-lg"
                >
                  &times;
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addChecklistItem}
              className="text-blue-600 text-sm"
            >
              + Add Checklist Item
            </button>
          </div>

          {/* Attachments */}
          <div className='mt-3'>
              <label className='text-xs font-medium text-slate-600'>
                Add Attachments
              </label>

              <AddAttachmentsInput
                attachments={taskData?.attachments}
                setAttachments={( value ) =>
                  handleValueChange("attachments", value)
                }
              />
          </div>
              
          {/* Submit */}
          <div>
            <button
              type="submit"
              className="add-btn w-full"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateSelfTask;
