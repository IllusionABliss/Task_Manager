import { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import toast from 'react-hot-toast';
import moment from 'moment';

const CommentsSection = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_PATHS.COMMENTS.GET_COMMENTS(taskId));
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const response = await axios.post(API_PATHS.COMMENTS.ADD_COMMENT(taskId), {
        content: newComment.trim()
      });

      setComments(prev => [...prev, response.data]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await axios.delete(API_PATHS.COMMENTS.DELETE_COMMENT(commentId));
      setComments(prev => prev.filter(comment => comment._id !== commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    try {
      return moment(dateString).format('MMM DD, YYYY HH:mm');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments & Discussion</h3>

      {/* Comments List */}
      <div className="space-y-4 mb-6">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet. Start the discussion!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                {comment.userProfileImage ? (
                  <img
                    src={comment.userProfileImage}
                    alt={comment.userName}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {comment.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{comment.userName}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                    {/* Delete button - only show for comment author or admin */}
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-red-500 hover:text-red-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete comment"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
                {comment.attachments && comment.attachments.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Attachments:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {comment.attachments.map((attachment, index) => (
                        <a
                          key={index}
                          href={attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Attachment {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="border-t pt-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              disabled={submitting}
            />
          </div>
          <div className="flex-shrink-0">
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Posting...</span>
                </>
              ) : (
                <span>Comment</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentsSection;