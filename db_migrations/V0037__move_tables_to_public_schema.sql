-- Move all tables from custom schema to public schema
ALTER TABLE t_p19166386_bankruptcy_course_cr.users SET SCHEMA public;
ALTER TABLE t_p19166386_bankruptcy_course_cr.course_modules SET SCHEMA public;
ALTER TABLE t_p19166386_bankruptcy_course_cr.lessons SET SCHEMA public;
ALTER TABLE t_p19166386_bankruptcy_course_cr.materials SET SCHEMA public;
ALTER TABLE t_p19166386_bankruptcy_course_cr.user_purchases SET SCHEMA public;
ALTER TABLE t_p19166386_bankruptcy_course_cr.user_progress SET SCHEMA public;
ALTER TABLE t_p19166386_bankruptcy_course_cr.course_files SET SCHEMA public;
ALTER TABLE t_p19166386_bankruptcy_course_cr.chat_tokens SET SCHEMA public;
ALTER TABLE t_p19166386_bankruptcy_course_cr.chat_tokens_pool SET SCHEMA public;
ALTER TABLE t_p19166386_bankruptcy_course_cr.support_messages SET SCHEMA public;
ALTER TABLE t_p19166386_bankruptcy_course_cr.support_message_reactions SET SCHEMA public;
ALTER TABLE t_p19166386_bankruptcy_course_cr.password_reset_tokens SET SCHEMA public;
ALTER TABLE t_p19166386_bankruptcy_course_cr.chat_access SET SCHEMA public;