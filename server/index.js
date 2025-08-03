const express = require("express");
const router = require("./router/user");
const connectDB = require("./conf/db");
const cors = require("cors");
const app = express();
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const movieRoutes = require("./router/movie");
const contectRouter = require("./router/contect");
// const os = require("os");
// const cluster = require("cluster");

// DBconnect
connectDB();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
dotenv.config();
app.use(express.json());
app.use("/api", router);
app.use("/api/movie", movieRoutes);
app.use("/api", contectRouter);

// cluster Use
// const numCPUs = os.cpus().length;

// if (cluster.isPrimary) {
//   console.log(`🔵 Primary process ${process.pid} is running`);

//   // Workers fork karo
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   // Agar worker crash ho jaye
//   cluster.on("exit", (worker, code, signal) => {
//     console.log(`🔴 Worker ${worker.process.pid} died. Restarting...`);
//     cluster.fork();
//   });
// } else {
//   let PROT = 8000;
//   app.listen(PROT, () => {
//     console.log("server connect");
//   });
// }
let PROT = process.env.PORT || 8001;
app.listen(PROT, () => {
  console.log("server connect", PROT);
});
