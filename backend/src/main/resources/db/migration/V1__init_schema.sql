-- ============================================================
-- V1: initial schema for Smart Job Tracker
-- ============================================================

CREATE TABLE users (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE companies (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    user_id    BIGINT       NOT NULL,
    name       VARCHAR(150) NOT NULL,
    website    VARCHAR(255),
    industry   VARCHAR(100),
    location   VARCHAR(150),
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_companies_user_name UNIQUE (user_id, name),
    CONSTRAINT fk_companies_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE applications (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    user_id      BIGINT       NOT NULL,
    company_id   BIGINT       NOT NULL,
    job_title    VARCHAR(150) NOT NULL,
    job_type     VARCHAR(20)  NOT NULL,
    location     VARCHAR(150),
    work_mode    VARCHAR(20),
    salary       VARCHAR(50),
    job_url      VARCHAR(500),
    applied_date DATE,
    deadline     DATE,
    status       VARCHAR(30)  NOT NULL DEFAULT 'SAVED',
    source       VARCHAR(30),
    resume_used  VARCHAR(150),
    notes        TEXT,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_applications_user    FOREIGN KEY (user_id)    REFERENCES users (id),
    CONSTRAINT fk_applications_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT chk_app_job_type  CHECK (job_type IN ('INTERNSHIP','FULL_TIME','PART_TIME')),
    CONSTRAINT chk_app_work_mode CHECK (work_mode IS NULL OR work_mode IN ('ON_SITE','HYBRID','REMOTE')),
    CONSTRAINT chk_app_status    CHECK (status IN ('SAVED','APPLIED','ONLINE_ASSESSMENT','INTERVIEW','OFFER','REJECTED','WITHDRAWN')),
    CONSTRAINT chk_app_source    CHECK (source IS NULL OR source IN ('LINKEDIN','COMPANY_WEBSITE','REFERRAL','COLLEGE_PLACEMENT','JOB_PORTAL','OTHER'))
) ENGINE=InnoDB;

CREATE INDEX idx_app_user_status    ON applications (user_id, status);
CREATE INDEX idx_app_user_deadline  ON applications (user_id, deadline);
CREATE INDEX idx_app_user_applied   ON applications (user_id, applied_date);

CREATE TABLE interviews (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    application_id BIGINT       NOT NULL,
    round          VARCHAR(20)  NOT NULL,
    interview_date DATETIME     NOT NULL,
    mode           VARCHAR(20),
    interviewer    VARCHAR(100),
    result         VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    notes          TEXT,
    PRIMARY KEY (id),
    CONSTRAINT fk_interviews_application FOREIGN KEY (application_id)
        REFERENCES applications (id) ON DELETE CASCADE,
    CONSTRAINT chk_int_round  CHECK (round IN ('HR','TECHNICAL','MANAGERIAL','CODING','SYSTEM_DESIGN','OTHER')),
    CONSTRAINT chk_int_mode   CHECK (mode IS NULL OR mode IN ('ONLINE','ON_SITE','PHONE')),
    CONSTRAINT chk_int_result CHECK (result IN ('PENDING','PASSED','FAILED','RESCHEDULED'))
) ENGINE=InnoDB;

CREATE INDEX idx_int_date ON interviews (interview_date);

CREATE TABLE application_status_history (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    application_id BIGINT       NOT NULL,
    old_status     VARCHAR(30),
    new_status     VARCHAR(30)  NOT NULL,
    changed_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note           VARCHAR(255),
    PRIMARY KEY (id),
    CONSTRAINT fk_history_application FOREIGN KEY (application_id)
        REFERENCES applications (id) ON DELETE CASCADE,
    CONSTRAINT chk_hist_old CHECK (old_status IS NULL OR old_status IN ('SAVED','APPLIED','ONLINE_ASSESSMENT','INTERVIEW','OFFER','REJECTED','WITHDRAWN')),
    CONSTRAINT chk_hist_new CHECK (new_status IN ('SAVED','APPLIED','ONLINE_ASSESSMENT','INTERVIEW','OFFER','REJECTED','WITHDRAWN'))
) ENGINE=InnoDB;

CREATE INDEX idx_hist_app_changed ON application_status_history (application_id, changed_at);
