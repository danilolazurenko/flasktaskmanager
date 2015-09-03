drop table if exists tasks;
create table tasks (
  id integer primary key autoincrement,
  title text not null,
  description text not null,
  timefortask text not null
);