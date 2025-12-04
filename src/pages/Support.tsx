import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import SupportMessage from '@/components/support/SupportMessage';
import SupportMessageInput from '@/components/support/SupportMessageInput';
import { useSupportChat } from '@/components/support/useSupportChat';

export default function Support() {
  const {
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
    userId,
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
  } = useSupportChat();

  let lastDate = '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card className="h-[80vh] flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                >
                  <Icon name="ArrowLeft" size={20} />
                </Button>
                <div>
                  <CardTitle>Поддержка юристов</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Задайте вопрос нашим специалистам
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    По регламенту ответ придёт в течение суток, но мы сделаем всё возможное, чтобы ответить быстрее.
                  </p>
                </div>
              </div>
              <Icon name="MessageCircle" size={24} className="text-purple-600" />
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Icon name="MessageCircle" size={64} className="mb-4 opacity-20" />
                <p className="text-lg font-medium">Пока нет сообщений</p>
                <p className="text-sm">Начните диалог с юристом</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const msgDate = formatDate(msg.created_at);
                  const showDate = msgDate !== lastDate;
                  lastDate = msgDate;

                  return (
                    <div key={msg.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                            {msgDate}
                          </span>
                        </div>
                      )}
                      
                      <SupportMessage
                        msg={msg}
                        userId={userId}
                        formatTime={formatTime}
                        getReactionCount={getReactionCount}
                        hasUserReacted={hasUserReacted}
                        handleReaction={handleReaction}
                        setReplyToMessage={setReplyToMessage}
                        setEditingMessage={setEditingMessage}
                        setNewMessage={setNewMessage}
                        handleDeleteMessage={handleDeleteMessage}
                      />
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </CardContent>

          <SupportMessageInput
            replyToMessage={replyToMessage}
            setReplyToMessage={setReplyToMessage}
            editingMessage={editingMessage}
            setEditingMessage={setEditingMessage}
            imagePreview={imagePreview}
            setSelectedImage={setSelectedImage}
            setImagePreview={setImagePreview}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            isSending={isSending}
            selectedImage={selectedImage}
            handleImageSelect={handleImageSelect}
            handleFileSelect={handleFileSelect}
            handleSendMessage={handleSendMessage}
          />
        </Card>
      </div>
    </div>
  );
}