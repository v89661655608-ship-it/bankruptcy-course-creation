import AdminChatList from '@/components/admin-support/AdminChatList';
import AdminChatWindow from '@/components/admin-support/AdminChatWindow';
import { useAdminSupport } from '@/components/admin-support/useAdminSupport';

export default function AdminSupport() {
  const {
    chats,
    selectedChatUserId,
    setSelectedChatUserId,
    messages,
    newMessage,
    setNewMessage,
    isSending,
    selectedImage,
    setSelectedImage,
    imagePreview,
    setImagePreview,
    selectedFile,
    setSelectedFile,
    replyToMessage,
    setReplyToMessage,
    editingMessage,
    setEditingMessage,
    messagesEndRef,
    navigate,
    handleImageSelect,
    handleFileSelect,
    handleSendMessage,
    handleDeleteMessage,
    handleReaction,
    formatTime,
    formatDate,
    getReactionCount,
    hasUserReacted
  } = useAdminSupport();

  const selectedChat = chats.find(c => c.user_id === selectedChatUserId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-12 gap-4 h-[85vh]">
          <AdminChatList
            chats={chats}
            selectedChatUserId={selectedChatUserId}
            setSelectedChatUserId={setSelectedChatUserId}
            formatDate={formatDate}
            formatTime={formatTime}
            onBack={() => navigate('/admin')}
          />

          <AdminChatWindow
            selectedChatUserId={selectedChatUserId}
            selectedChat={selectedChat}
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            isSending={isSending}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            replyToMessage={replyToMessage}
            setReplyToMessage={setReplyToMessage}
            editingMessage={editingMessage}
            setEditingMessage={setEditingMessage}
            messagesEndRef={messagesEndRef}
            handleImageSelect={handleImageSelect}
            handleFileSelect={handleFileSelect}
            handleSendMessage={handleSendMessage}
            handleDeleteMessage={handleDeleteMessage}
            handleReaction={handleReaction}
            formatTime={formatTime}
            formatDate={formatDate}
            getReactionCount={getReactionCount}
            hasUserReacted={hasUserReacted}
          />
        </div>
      </div>
    </div>
  );
}
