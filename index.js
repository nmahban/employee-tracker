const inquirer = require("inquirer");
const { Client } = require("pg");
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "employee-tracker",
  password: "qZzdkyFVdG4gKkp34vmp",
  port: 5432,
});

client.connect();

const mainMenu = async () => {
  const { choice } = await inquirer.prompt({
    type: "list",
    name: "choice",
    message: "What would you like to do?",
    choices: [
      "View all departments",
      "View all roles",
      "View all employees",
      "Add a role",
      "add an employee",
      "Update an employee role",
      "Exit",
    ],
  });

  switch (choice) {
    case "View all departments":
      await viewDepartments();
      break;
    case "View all roles":
      await viewRoles();
      break;
    case "View all employees":
      await viewEmployees();
      break;
    case "Add a department":
      await addDepartment();
      break;
    case "Add a role":
      await addRole();
      break;
    case "Add an employee":
      await addEmployee();
      break;
    case "Update an employee role":
      await updateEmployeeRole();
      break;
    case "Exit":
      client.end();
      process.exit();
      break;
  }
};

const viewDepartments = async () => {
  try {
    const res = await client.query(`SELECT * FROM department`);
    console.table(res.rows);
    mainMenu();
  } catch (err) {
    console.error(`Error viewing departments:`, err);
    mainMenu();
  }
};

const viewRoles = async () => {
  try {
    const res = await client.query(
      "SELECT r.id AS role_id, r.title AS title, r.salary AS salary, d.name AS department FROM role r JOIN department d ON r.department_id = d.id"
    );
    console.table(res.rows);
    mainMenu();
  } catch (err) {
    console.error("Error viewing roles:", err);
    mainMenu();
  }
};

const viewEmployees = async () => {
  try {
    const res = await client.query(`
            SELECT e.id AS employee_id, e.first_name AS first_name, e.last_name AS last_name, 
                   r.title AS job_title, d.name AS department, r.salary AS salary,
                   CONCAT(m.first_name, ' ', m.last_name) AS manager
            FROM employee e
            JOIN role r ON e.role_id = r.id
            JOIN department d ON r.department_id = d.id
            LEFT JOIN employee m ON e.manager_id = m.id
        `);
    console.table(res.rows);
    mainMenu();
  } catch (err) {
    console.error("Error viewing employees", err);
    mainMenu();
  }
};

const addRole = async () => {
  try {
    const departments = (await client.query("SELECT * FROM department")).rows;
    const departmentChoices = departments.map((d) => ({
      name: d.name,
      value: d.id,
    }));

    const { title, salary, department_id } = await inquirer.prompt([
      {
        type: "input",
        name: "title",
        message: "Enter the title of the new role:",
      },
      {
        type: "input",
        name: "salary",
        message: "Enter the salary for the new role:",
        validate: (value) =>
          !isNaN(value) ? true : "Please enter a valid number",
      },
      {
        type: "list",
        name: "department_id",
        message: "Select the department for the new role:",
        choices: departmentChoices,
      },
    ]);

    await client.query(
      "INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)",
      [title, salary, department_id]
    );
    console.log("Role added!");
    mainMenu();
  } catch (err) {
    console.error("Error adding role:", err);
    mainMenu();
  }
};

const addDepartment = async () => {
  try {
    const { name } = await inquirer.prompt({
      type: "input",
      name: "name",
      message: "Enter the name of the new department:",
    });

    await client.query("INSERT INTO department (name) VALUES ($1)", [name]);
    console.log("Department added!");
    mainMenu();
  } catch (err) {
    console.error(`Error adding department:`, err);
    mainMenu();
  }
};

const addEmployee = async () => {
  try {
    const roles = (await client.query("SELECT * FROM role")).rows;
    const roleChoices = roles.map((r) => ({ name: r.title, value: r.id }));

    const managers = (await client.query("SELECT * FROM employee")).rows;
    const managerChoices = managers.map((m) => ({
      name: m.first_name + " " + m.last_name,
      value: m.id,
    }));
    managerChoices.push({ name: "None", value: null });

    const { first_name, last_name, role_id, manager_id } =
      await inquirer.prompt([
        {
          type: "input",
          name: "first_name",
          message: "Enter employee first name:",
        },
        {
          type: "input",
          name: "last_name",
          message: "Enter the employee last name:",
        },
        {
          type: "list",
          name: "role_id",
          message: "Enter the employee role:",
        },
        {
          type: "list",
          name: "manager_id",
          message: "Select the employee manager",
          choice: managerChoices,
        },
      ]);
    await client.query(
      "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)",
      [first_name, last_name, role_id, manager_id]
    );
    console.log("Employee added!");
    mainMenu();
  } catch (err) {
    console.error("Error adding employee:", err);
    mainMenu();
  }
};
const updateEmployeeRole = async () => {
  try {
    const employees = (await client.query("SELECT * FROM employee")).rows;
    const employeeChoices = employees.map((e) => ({
      name: e.first_name + " " + e.last_name,
      value: e.id,
    }));

    const roles = (await client.query("SELECT * FROM role")).rows;
    const roleChoices = roles.map((r) => ({ name: r.title, value: r.id }));

    const { employee_id, role_id } = await inquirer.prompt([
      {
        type: "list",
        name: "employee_id",
        message: "Select the employee to update:",
        choices: employeeChoices,
      },
      {
        type: "list",
        name: "role_id",
        message: "Select the new role for the employee:",
        choices: roleChoices,
      },
    ]);

    await client.query("UPDATE employee SET role_id = $1 WHERE id = $2", [
      role_id,
      employee_id,
    ]);
    console.log("Employee role updated!");
    mainMenu();
  } catch (err) {
    console.error("Error updating employee role:", err);
    mainMenu();
  }
};

mainMenu();
