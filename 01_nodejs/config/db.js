import pkg from "pg";
import dotenv from "dotenv";
const {Pool}=pkg;
dotenv.config();

const pool= new Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    password:process.env.DB_PASSWORD,
    database:process.env.DATABASE,
    port:process.env.DBPORT,

});

pool.on("connect",()=>{
    console.log("connection pool established with database");
});

export default pool;