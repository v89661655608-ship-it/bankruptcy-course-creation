-- Move all tables back to original schema
ALTER TABLE public.users SET SCHEMA t_p19166386_bankruptcy_course_cr;
ALTER TABLE public.course_modules SET SCHEMA t_p19166386_bankruptcy_course_cr;
ALTER TABLE public.lessons SET SCHEMA t_p19166386_bankruptcy_course_cr;
ALTER TABLE public.materials SET SCHEMA t_p19166386_bankruptcy_course_cr;
ALTER TABLE public.user_purchases SET SCHEMA t_p19166386_bankruptcy_course_cr;
ALTER TABLE public.user_progress SET SCHEMA t_p19166386_bankruptcy_course_cr;
ALTER TABLE public.course_files SET SCHEMA t_p19166386_bankruptcy_course_cr;
ALTER TABLE public.chat_tokens SET SCHEMA t_p19166386_bankruptcy_course_cr;
ALTER TABLE public.chat_tokens_pool SET SCHEMA t_p19166386_bankruptcy_course_cr;
ALTER TABLE public.support_messages SET SCHEMA t_p19166386_bankruptcy_course_cr;
ALTER TABLE public.support_message_reactions SET SCHEMA t_p19166386_bankruptcy_course_cr;
ALTER TABLE public.password_reset_tokens SET SCHEMA t_p19166386_bankruptcy_course_cr;
ALTER TABLE public.chat_access SET SCHEMA t_p19166386_bankruptcy_course_cr;