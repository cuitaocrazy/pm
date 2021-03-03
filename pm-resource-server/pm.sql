-- CREATE ROLE pm WITH
--   LOGIN
--   ENCRYPTED PASSWORD 'pm';

-- CREATE DATABASE pm
--     WITH 
--     OWNER = pm;

-- 费用结算表
CREATE TABLE cost_settlement
(
    emp_group text,
    emp_no text,
    emp_name text,
    proj_id text,
    proj_org text,
    proj_zone text,
    proj_type text,
    proj_name text,
    proj_status text,
    leader_group text,
    leader_no text,
    leader_name text,
    settle_month text,
    cost_date text,
    cost_type text,
    cost_description text,
    amount money,
    yyyy text,
    yyyymm text,
    yyyymmdd text,
    yyyyq text
);

-- 日报结算表
CREATE TABLE daily_settlement
(
    emp_group text,
    emp_no text,
    emp_name text,
    proj_id text,
    proj_org text,
    proj_zone text,
    proj_type text,
    proj_name text,
    proj_status text,
    leader_group text,
    leader_no text,
    leader_name text,
    settle_month text,
    daily_date text,
    daily_content text,
    time_consuming real,
    md real,
    amount money,
    work_days_of_month int,
    yyyy text,
    yyyymm text,
    yyyymmdd text,
    yyyyq text
);

-- 目前使用的是postgresql是11，generated column在12以上才支持，生产使用11的版本，以后升级时可使用
-- -- daily_settlement
-- alter table daily_settlement add column
-- YYYY text generated always as (substring(daily_date from 1 for 4)) stored;
-- alter table daily_settlement add column
-- YYYYMM text generated always as (substring(daily_date from 1 for 6)) stored;
-- alter table daily_settlement add column
-- YYYYMMDD text generated always as (daily_date) stored;
-- alter table daily_settlement add column
-- YYYYQ text generated always as (
--   case
--     when substring(daily_date from 5 for 2) in ('01', '02', '03') then substring(daily_date from 1 for 4) || '1'
--     when substring(daily_date from 5 for 2) in ('04', '05', '06') then substring(daily_date from 1 for 4) || '2'
--     when substring(daily_date from 5 for 2) in ('07', '08', '09') then substring(daily_date from 1 for 4) || '3'
--     else '4'
--   end
-- ) stored;

-- -- cost_settlement
-- alter table cost_settlement add column
-- YYYY text generated always as (substring(cost_date from 1 for 4)) stored;
-- alter table cost_settlement add column
-- YYYYMM text generated always as (substring(cost_date from 1 for 6)) stored;
-- alter table cost_settlement add column
-- YYYYMMDD text generated always as (cost_date) stored;
-- alter table cost_settlement add column
-- YYYYQ text generated always as (
--   case
--     when substring(cost_date from 5 for 2) in ('01', '02', '03') then substring(cost_date from 1 for 4) || '1'
--     when substring(cost_date from 5 for 2) in ('04', '05', '06') then substring(cost_date from 1 for 4) || '2'
--     when substring(cost_date from 5 for 2) in ('07', '08', '09') then substring(cost_date from 1 for 4) || '3'
--     else '4'
--   end
-- ) stored;