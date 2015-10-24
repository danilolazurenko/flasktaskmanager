drop table if exists tasks;
drop table if exists logins_passwords;
create table tasks (
  id integer primary key autoincrement,
  title text not null,
  description text,
  status text,
  timespent real
);

create table tasks_statistics (
  statistics_id integer primary key autoincrement,
  track_period integer,
  starttime text not null,
  endtime text not null,
  foreign key (track_period) references tasks(id)
);

create table logins_passwords (
  id integer primary key autoincrement,
  login text not null,
  password text not null
);

create index title_index on tasks (title);
create index start_time_index on tasks_statistics (starttime);
create index end_time_index on tasks_statistics (endtime);
create index status_index on tasks (status);
