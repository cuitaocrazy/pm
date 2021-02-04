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
    proj_name text,
    proj_type text,
    leader_group text,
    leader_no text,
    leader_name text,
    settle_month text,
    cost_date text,
    cost_type text,
    cost_description text,
    amount money
);

-- 日报结算表
CREATE TABLE daily_settlement
(
    emp_group text,
    emp_no text,
    emp_name text,
    proj_id text,
    proj_name text,
    proj_type text,
    leader_group text,
    leader_no text,
    leader_name text,
    settle_month text,
    daily_date text,
    daily_content text,
    time_consuming real,
    md real,
    amount money,
    work_days_of_month int
);