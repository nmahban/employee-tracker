INSERT INTO department (name) VALUES
('Sales'),
('Engineering'),
('HR');

INSERT INTO role (title, salary, department_id) VALUES
('Sales Manager', 80000, 1),
('Sales Associate', 50000, 1),
('Software Engineer', 90000, 2),
('HR Specialist', 60000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id) Values 
('john', 'Doe', 1, NULL),
('Jane', 'Smith', 3, NULL);
