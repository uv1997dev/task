import { adminLoginValidateSchema } from "../validator/validateAdmin.js";
import admin from "../collections/admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import employee from "../collections/user.js";
import { Novu } from '@novu/node'; 
import schedule from 'node-schedule';
import scheduleModel from '../collections/schedule.js'
import { ValidateSchema } from "../validator/validateSchema.js";
import { connection } from "../app.js";

// 166b2fd47e948991b37d0e666cb961f6

const novu = new Novu('166b2fd47e948991b37d0e666cb961f6');



export const mailLogin = async (req, res) => {
  try {
    // Validate request body
    const validationResult = adminLoginValidateSchema.validate(req.body);
    if (validationResult.length) {
      const err = validationResult.map((err) => err.message);
      console.log("Validation error:", err); // Log validation error
      return res.json({ success: false, err });
    }

    // Check if admin exists in MySQL
    connection.query('SELECT * FROM admin WHERE email = ?', [req.body.email], async (err, results) => {
      if (err) {
        console.log("MySQL error:", err); // Log MySQL error
        return res.json({ success: false, message: "server error" });
      }

      if (results.length === 0) {
        console.log("Admin not found"); // Log admin not found
        return res.json({ success: false, message: "user not found!" });
      }

      console.log("Admin data:", results[0]); // Log admin data
      const exist = results[0];

      // Check password
      if (req.body.password === exist.password) {
        const token = jwt.sign(
          { id: exist.id, email: exist.email },
          "test@@1122",
          { expiresIn: "1d" }
        );
        res.cookie("token", token, { httpOnly: true });
        res.json({ success: true, message: "login successfully", token });
      } else {
        console.log("Invalid password"); // Log invalid password
        return res.json({ success: false, message: "invalid credentials!" });
      }
    });
  } catch (error) {
    console.log("Server error:", error); // Log server error
    return res.json({ success: false, message: "server error" });
  }
};


export const getAccessPage = async (req, res) => {
  try {
    // Retrieve admin user from MySQL
    connection.query('SELECT * FROM admin WHERE id = ?', [res.id], async (err, results) => {
      if (err) {
        console.log("MySQL error:", err); // Log MySQL error
        return res.json({ success: false, message: "server error" });
      }

      if (results.length === 0) {
        console.log("Admin not found"); // Log admin not found
        return res.json({ success: false, message: "admin not found!" });
      }

      const adminUser = results[0];
      res.json({ success: true, adminUser });
    });
  } catch (error) {
    console.log("Server error:", error); // Log server error
    return res.json({ success: false, message: "server error" });
  }
};


export const createSchedule = async (req, res) => {
  try {
    console.log(req.body);
    const validationResult = ValidateSchema.validate(req.body);
    if (validationResult.length) {
      const err = validationResult.map((err) => err.message);
      return res.json({ success: false, err });
    }
    const { date, time, comment, ids } = req.body;

    // Retrieve employees from MySQL
    connection.query('SELECT * FROM employee WHERE id IN (?)', [ids], async (err, employeeResults) => {
      if (err) {
        console.log("MySQL error:", err);
        return res.json({ success: false, message: "Server error" });
      }
      connection.query('INSERT INTO schedule (date, time, command, employees) VALUES (?, ?, ?,?)', [date, time, comment, JSON.stringify(employeeResults)], async (err, result) => {

        if (err) {
          console.error("MySQL error:", err);
          return res.json({ success: false, message: "Failed to create schedule" });
        }
        schedule.cancelJob();
        connection.query('SELECT * FROM schedule', (err, rows) => {
          if (err) throw err;
          console.log('Data retrieved from MySQL database:');
          console.log(rows,"this is the shit");
          rows.forEach(element => {
            const meetingDateTime = new Date(`${element.date}T${element.time}`);

            const notificationTime1 = new Date(meetingDateTime.getTime() - (60 * 1000)); 
            const notificationTime2 = new Date(meetingDateTime.getTime() - (50 * 1000));

            schedule.scheduleJob(notificationTime1, function () {
              JSON.parse(element.employees).forEach((employee) => {
                    novu.trigger('onboarding-workflow', {
                      to: {
                        subscriberId: employee.id,
                        email: employee.email
                      },
                      payload: {
                        "test": employee.name,
                        "comment": element.command
                      }
                    });
                  });
                });

                schedule.scheduleJob(notificationTime2, function () {
                  JSON.parse(element.employees).forEach((employee) => {
                        novu.trigger('onboarding-workflow', {
                          to: {
                            subscriberId: employee._id,
                            email: employee.email
                          },
                          payload: {
                            "test": employee.name,
                            "comment": element.comment 
                          }
                        })
                        connection.query('SELECT * FROM admin', (err, rows) => {
                          novu.trigger('onboarding-workflow', {
                            to: {
                              subscriberId: rows[0].id,
                              email: 'test007@yapmail.com' // use proper email to send notification 
                            },
                            payload: {
                              "test": "hello admin",
                              "comment": "email sended successfully" 
                            }
                          })
                        })
                      });
                    })

                  })
                  res.json({ success: true, message: "Meeting scheduled successfully" });
        });
      })
    })

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

