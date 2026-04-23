import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { API_PATHS } from "../../utils/apiPaths";
import axiosInstance from "../../utils/axiosInstance";
import { LuFileSpreadsheet, LuChevronLeft, LuChevronRight, LuSearch, LuX } from "react-icons/lu";
import TaskStatusTabs from "../../components/TaskStatusTabs";
import TaskCard from "../../components/Cards/TaskCard";
import toast from "react-hot-toast";

const ManageTasks = () => {

  const [allTasks, setAllTasks] = useState([]);
  
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Search and sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  
  const navigate = useNavigate();

  const getAllTasks = async (page = 1, search = "", sort = "createdAt", order = "desc") => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: {
          status: filterStatus === "All" ? "" : filterStatus,
          page,
          limit: perPage,
          search: search || undefined,
          sortBy: sort,
          sortOrder: order,
        },
      });

      setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);
      
      // Update pagination info
      if (response.data?.pagination) {
        setCurrentPage(response.data.pagination.page);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.totalItems);
      }
    
      // Map statusSummary data with fixed labels and order
      const statusSummary = response.data?.statusSummary || {};

      const statusArray = [
        { label: "All", count: statusSummary.all || 0 },
        { label: "Pending", count: statusSummary.pendingTasks || 0},
        { label: "In Progress", count: statusSummary.inProgressTasks || 0},
        { label: "Completed", count: statusSummary.completedTasks || 0},
        { label: "Overdue", count: statusSummary.overdueTasks || 0 }
      ];

      setTabs(statusArray);
      setLoading(false);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        toast.error("Failed to load tasks");
        setLoading(false);
    }
  };

  const handleClick = (taskData) => {
    if (taskData.createdBySelf) {
      navigate(`/user/task-details/${taskData._id}`);
    } else {
      navigate(`/admin/create-task`, { state: { taskId: taskData._id } });
    }
  };

  // download task report
  const handleDownloadReport = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "task_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error downloading task details:", error);
      toast.error("Failed to download task details. Please try again.");
    }  
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      getAllTasks(newPage, searchQuery, sortBy, sortOrder);
    }
  };

  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value);
    setPerPage(newPerPage);
    setCurrentPage(1);
    getAllTasks(1, searchQuery, sortBy, sortOrder);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setCurrentPage(1);
    getAllTasks(1, query, sortBy, sortOrder);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    getAllTasks(1, "", sortBy, sortOrder);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    setCurrentPage(1);
    getAllTasks(1, searchQuery, newSort, sortOrder);
  };

  const handleSortOrderChange = (order) => {
    setSortOrder(order);
    setCurrentPage(1);
    getAllTasks(1, searchQuery, sortBy, order);
  };

  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery("");
    getAllTasks(1, "", sortBy, sortOrder);
  }, [filterStatus]);

  return (
    <DashboardLayout activeMenu="Manage Tasks">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between"> 
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl md:text-xl font-medium">Assigned Tasks</h2>
            <button
              className="flex lg:hidden download-btn"
              onClick={handleDownloadReport}
            >
              <LuFileSpreadsheet className="text-lg" />
              Download Report
            </button>
          </div>

          {tabs?.[0]?.count > 0 && (
            <div className="flex items-center gap-3">
              <TaskStatusTabs
                tabs={tabs}
                activeTab={filterStatus}
                setActiveTab={setFilterStatus}
              />

              <button className="hidden lg:flex download-btn" onClick={handleDownloadReport}>
                <LuFileSpreadsheet className="text-lg" />
                Download Report
              </button>
            </div>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="mt-4 card">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="flex items-center">
                <LuSearch className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks by title or description..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 text-gray-400 hover:text-gray-600"
                  >
                    <LuX />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-xs text-gray-500 mt-1">
                  Searching for: "{searchQuery}"
                </p>
              )}
            </div>

            {/* Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Sort By:
                </label>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="createdAt">Created Date</option>
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Order:
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSortOrderChange("desc")}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
                      sortOrder === "desc"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => handleSortOrderChange("asc")}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
                      sortOrder === "asc"
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Oldest
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {loading ? (
            <div className="col-span-1 md:col-span-3 text-center py-8">
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          ) : allTasks?.length > 0 ? (
            allTasks.map((item) => (
              <TaskCard
                key={item._id}
                title={item.title}
                description={item.description}
                priority={item.priority}
                status={item.status}
                progress={item.progress}
                createdAt={item.createdAt}
                dueDate={item.dueDate}
                assignedTo={item.assignedTo?.map((item) => item.profileImageUrl)}
                attachmentCount={item.attachments?.length || 0}
                completedTodoCount={item.completedTodoCount || 0}
                todoChecklist={item.todoChecklist || []}
                createdBySelf={item.createdBySelf}
                onClick={() => handleClick(item)}
              />
            ))
          ) : (
            <div className="col-span-1 md:col-span-3 text-center py-8">
              <p className="text-gray-500">
                {searchQuery ? "No tasks match your search" : "No tasks found"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Items Per Page Selector */}
            <div className="flex items-center gap-2">
              <label htmlFor="perPage" className="text-sm font-medium text-gray-600">
                Items per page:
              </label>
              <select
                id="perPage"
                value={perPage}
                onChange={handlePerPageChange}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Pagination Info */}
            <div className="text-sm text-gray-600">
              Showing {totalItems > 0 ? (currentPage - 1) * perPage + 1 : 0} to {Math.min(currentPage * perPage, totalItems)} of {totalItems} tasks
            </div>

            {/* Pagination Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LuChevronLeft className="text-lg" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, array) => {
                    if (index > 0 && array[index - 1] !== page - 1) {
                      return [
                        <span key={`ellipsis-${page}`} className="px-2 text-gray-400">...</span>,
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded text-sm ${
                            currentPage === page
                              ? "bg-primary text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>,
                      ];
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded text-sm ${
                          currentPage === page
                            ? "bg-primary text-white"
                            : "border border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LuChevronRight className="text-lg" />
              </button>
            </div>
          </div>
        )}
      </div> 
    </DashboardLayout> 
  );
};

export default ManageTasks;