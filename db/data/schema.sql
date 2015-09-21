drop table if exists tasks;
drop table if exists logins_passwords;
create table tasks (
  id integer primary key autoincrement,
  title text not null,
  description text not null
);

create table logins_passwords (
  id integer primary key autoincrement,
  login text not null,
  password text not null
);

create table statistics (
  id integer primary key autoincrement,
  title text not null,
  timespent integer,
  startdate text not null,
  enddate text not null,
  starttime text not null,
  endtime text not null,
  description text
);

