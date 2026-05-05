const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   STATIC FILES
========================= */
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/images", express.static(path.join(__dirname, "../images")));

/* =========================
   HOME PAGE
========================= */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

/* =========================
   GET ROOMS
========================= */
app.get("/rooms", (req, res) => {
  db.query("SELECT * FROM rooms", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

/* =========================
   BOOK ROOM (FIXED + FULL DATA SAVE)
========================= */
app.post("/book", (req, res) => {
  const {
    user_id,
    room_id,
    name,
    address,
    age,
    check_in,
    check_out,
    booking_date
  } = req.body;

  db.query(
    "SELECT * FROM bookings WHERE room_id=? AND status='Active'",
    [room_id],
    (err, rows) => {
      if (err) return res.status(500).json(err);

      if (rows.length > 0) {
        return res.json({ message: "Room already booked ❌" });
      }

      db.query(
        `INSERT INTO bookings 
        (user_id, room_id, name, address, age, check_in, check_out, booking_date, status)
        VALUES (?,?,?,?,?,?,?,?, 'Active')`,
        [
          user_id,
          room_id,
          name,
          address,
          age,
          check_in,
          check_out,
          booking_date
        ],
        (err, result) => {
          if (err) return res.status(500).json(err);

          db.query(
            "UPDATE rooms SET status='Booked' WHERE id=?",
            [room_id],
            () => {
              res.json({
                message: "success",
                booking_id: result.insertId
              });
            }
          );
        }
      );
    }
  );
});

/* =========================
   CANCEL BOOKING
========================= */
app.post("/cancel-booking", (req, res) => {
  const { room_id } = req.body;

  db.query(
    "UPDATE bookings SET status='Cancelled' WHERE room_id=? AND status='Active'",
    [room_id],
    (err) => {
      if (err) return res.status(500).json(err);

      db.query(
        "UPDATE rooms SET status='Available' WHERE id=?",
        [room_id],
        () => {
          res.json({ message: "Booking cancelled ❌" });
        }
      );
    }
  );
});

/* =========================
   HISTORY
========================= */
app.get("/history", (req, res) => {
  const sql = `
    SELECT b.*, r.room_number 
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    ORDER BY b.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.json([]);
    }

    res.json(result);
  });
});

/* =========================
   START SERVER
========================= */
app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});