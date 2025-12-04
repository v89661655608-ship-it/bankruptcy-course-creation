export interface Message {
  id: number;
  user_id: number;
  message: string;
  image_url?: string;
  file_url?: string;
  file_name?: string;
  file_type?: string;
  edited_at?: string;
  reply_to_id?: number;
  is_from_admin: boolean;
  created_at: string;
  read_by_admin: boolean;
  read_by_user: boolean;
  full_name: string;
  email: string;
  reactions: Array<{ reaction: string; user_id: number }>;
}

export interface Chat {
  user_id: number;
  full_name: string;
  email: string;
  last_message_time: string;
  unread_count: number;
  last_message: string;
}
