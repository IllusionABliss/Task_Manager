import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AvatarGroup from '../../components/AvatarGroup';
import CommentsSection from '../../components/CommentsSection';
import moment from 'moment';
import { useUserAuth } from "../../hooks/useUserAuth";
import { LuSquareArrowOutUpRight } from 'react-icons/lu';
import { useContext } from 'react';
import { UserContext } from '../../context/userContext';
import toast from 'react-hot-toast';

const ViewTaskDetails = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const { user } = useContext(UserContext);
  const userId = user?._id;
  const userRole = user?.role;
  const isAdmin = userRole === "admin";
  const isTaskOwner = task?.createdBy === userId;
  const isSelfTask = task?.createdBySelf === true;

  const canDelete = isTaskOwner && isSelfTask;
  
  const getStatusTagColor = (status) => {
  
    switch (status) {
      case "In Progress":
        return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
      
      case "Completed":
        return "text-lime-500 bg-lime-50 border border-lime-500/20";
      
      case "Overdue":
      return "text-red-500 bg-red-50 border border-red-500/20";
        
      default:
        return "text-violet-500 bg-violet-50 border border-violet-500/10";
    }
  };

  // get Task info by ID
  const getTaskDetailsByID = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_TASK_BY_ID(id)
      );

      if (response.data) {
        const taskInfo = response.data;
        setTask(taskInfo);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // handle todo check
  const updateTodoChecklist = async (index) => {
    const todoChecklist = [...task?.todoChecklist];
    const taskId = id;

    if (todoChecklist && todoChecklist[index]) {
      todoChecklist[index].completed = !todoChecklist[index].completed;
    
      try {
        const response = await axiosInstance.put(
          API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(taskId),
            {todoChecklist}
        );
        if (response.status === 200) {
          setTask(response.data?.task || task);
        } else {
          // Optionally revert the toggle if the API call fails.
          todoChecklist[index].completed = !todoChecklist[index].completed;
        }
      } catch (error) {
        todoChecklist[index].completed = !todoChecklist[index].completed;
      }
    }
  };
  
  // Handle attachment link lick
  const handleLinkClick = (link) => {
    if (!/^https?:\/\//i.test(link)){
      link = "https://"+ link; //Deafult to Https
    }
    window.open(link, "_blank");
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this task?");
    if (!confirm) return;

    try {
      await axiosInstance.delete(API_PATHS.TASKS.DELETE_TASK(id));
      toast.success("Task deleted successfully");
      if (userRole === "admin") {
        navigate("/admin/tasks");
      } else {
        navigate("/user/tasks");
      }
    } catch (error) {
      toast.error("Failed to delete task");
      console.error("Delete error:", error);
    }
  };

  useEffect(() => {
    if (id) {
    getTaskDetailsByID();
    }
    return () => {};
  }, [id]);
  
  return (
    <DashboardLayout activeMenu='My Tasks'>
      <div className="mt-5">
        {task && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
            <div className="col-span-3 bg-white rounded-xl shadow border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <h2 className="text-sm md:text-xl font-medium">
                  {task?.title}
                </h2>

                <div
                  className={`text-[11px] md:text-[13px] font-medium ${getStatusTagColor(
                    task?.status
                  )} px-4 py-0.5 rounded`}
                >
                  {task?.status}
                </div>
              </div>

              <div className='mt-4'>
                <InfoBox label="Description" value={task?.description} />
              </div>

              <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="col-span-6 md:col-span-4">
                  <InfoBox label="Priority" value={task?.priority} />
                </div>
                <div className="col-span-6 md:col-span-4">
                  <InfoBox
                    label="Due Date"
                    value={
                      task?.dueDate
                      ? moment (task?.dueDate).format("Do MMM YYYY")
                      : "N/A"
                    }
                  />
                </div>
                <div className="col-span-6 md:col-span-4">
                  <label className="text-xs font-medium text-slate-500">
                    Assigned To
                  </label>

                  <AvatarGroup
                    avatars={
                      task?.assignedTo?.map((item) => item?.profileImageUrl) ||
                      []
                    }
                    maxVisible={5}
                  />
                </div>
              </div>

              <div className="mt-2">
                <label className="text-xs font-medium text-slate-500">
                  Todo Checklist
                </label>

                {task?.todoChecklist?.map((item, index) => (
                  <TodoCheckList
                    key={`todo_${index}`}
                    text={item.text}
                    isChecked={item?.completed}
                    onChange={() => updateTodoChecklist(index)}
                  />
                ))}
              </div>

              {task?.attachments?.length > 0 && (
                <div className="mt-2">
                  <label className="text-xs font-medium text-slate-500">
                    Attachments
                  </label>

                  {task?.attachments?.map(( link, index) => (
                    <Attachment
                      key={`link_${index}`}
                      link={link}
                      index={index}
                      onClick={() => handleLinkClick(link)}
                    />
                  ))}
                </div>
              )}

              {/* Comments Section */}
              <div className="mt-6">
                <CommentsSection taskId={id} />
              </div>

              {canDelete && (
                <div className="mt-6">
                  <button
                    onClick={handleDelete}
                    className="w-full bg-red-100 text-red-600 py-2 rounded hover:bg-red-200 transition cursor-pointer"
                  >
                    Delete Task
                  </button>
                </div>
              )}
            </div>
          </div> 
        )}
      </div>
    </DashboardLayout>
  );
};

export default ViewTaskDetails;

const InfoBox = ({label, value}) => {
  return <>
    <label className="text-xs font-medium text-slate-500">{label}</label>

    <p className="text-[12px] md:text-[13px] font-medium text-gray-700 mt-0.5">
      {value}
    </p>
  </>
}

const TodoCheckList = ({ text, isChecked, onChange }) => {
  return (
    <div className="flex items-center gap-3 p-3">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none cursor-pointer"
      />

      <p className="text-[13px] text-gray-800">{text}</p>
    </div>
  )
};

const Attachment = ({ link, index, onClick}) => {
  return (
    <div
      className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3 mt-2 cursor-pointer"
      onClick={onClick}
    >
    <div className="flex-1 flex items-center gap-3">
      <span className="text-xstext-gray-400 font-semibold mr-2">
        {index < 9? `0${index + 1}` : index + 1}
      </span>

      <p className="text-xs text-black">{link}</p>
    </div>

      <LuSquareArrowOutUpRight className="text-gray-400" />
    </div>
  )
};