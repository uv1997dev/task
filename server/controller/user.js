import { AddEmployeeValidateSchema } from "../validator/validateEmployee.js"
import { Novu } from '@novu/node'; 
import { connection } from "../app.js";

const novu = new Novu('166b2fd47e948991b37d0e666cb961f6');



export const addUser = async (req, res) => {
    try {
      const employeeValidate = AddEmployeeValidateSchema.validate(req.body);
      if (employeeValidate.length) {
        const errors = employeeValidate.map(err => err.message);
        return res.json({ success: false, errors });
      }
  
      const { name, email } = req.body;
  
      // Insert employee data into MySQL
      connection.query('INSERT INTO employee (name, email) VALUES (?, ?)', [name, email], async (err, results) => {
        if (err) {
          console.log("MySQL error:", err); // Log MySQL error
          return res.json({ success: false, message: "server error" });
        }
  
        console.log(results,"this is the shit");

        const insertedEmployeeId = results.insertId;
  
        // Assuming you have another method to identify subscribers using novu library
        // This part is specific to your application setup and should be adapted accordingly
  
        // Here we are constructing a response containing the inserted employee data
        const insertedEmployee = { _id: insertedEmployeeId, name, email };
        res.json({ success: true, employee: insertedEmployee });
      });
    } catch (error) {
      console.log("Server error:", error); // Log server error
      return res.json({ success: false, message: "server error" });
    }
  };
  

  export const getUser = async (req, res) => {
    try {
      // Retrieve employees from MySQL
      connection.query('SELECT * FROM employee', async (err, results) => {
        if (err) {
          console.log("MySQL error:", err); // Log MySQL error
          return res.json({ success: false, error: err });
        }
  
        // If no error occurred, send back the retrieved employees
        res.json({ success: true, employees: results });
      });
    } catch (error) {
      console.log("Server error:", error); // Log server error
      return res.json({ success: false, error });
    }
  };
  