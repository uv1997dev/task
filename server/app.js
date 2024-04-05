import express from "express";
import cors from "cors";
import mainRouter  from './router/admin.js'
import userRouter from './router/employee.js'
import cookieParser from "cookie-parser";
import mysql from 'mysql'

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser())
//db connection
 export const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'admin_shedule'
  });

  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL database: ' + err.stack);
      return;
    }
    console.log('Connected to MySQL database as id ' + connection.threadId);
  });

//get single user
app.use('/api/admin', mainRouter )
app.use('/api/employee', userRouter )


app.listen(8080, () => {
    console.log('server is listening on port 8080');
})