const API = "http://localhost:4000";

let selectedRoom = null;

const roomPrices = {
  1: 1000, 2: 1500, 3: 2000,
  4: 1000, 5: 1500, 6: 2000,
  7: 1000, 8: 1500, 9: 2000,
  10: 1000, 11: 1500, 12: 2000
};

/* OPEN BOOKING */
function bookRoom(roomId) {
  selectedRoom = roomId;

  document.getElementById("bookingForm").style.display = "flex";

  document.getElementById("checkIn").value = "";
  document.getElementById("checkOut").value = "";
  document.getElementById("bookingDate").valueAsDate = new Date();

  document.getElementById("totalPrice").innerText = "Total: ₹0";
}

/* CLOSE FORM */
function closeForm() {
  document.getElementById("bookingForm").style.display = "none";
}

/* INIT */
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];

  const checkIn = document.getElementById("checkIn");
  const checkOut = document.getElementById("checkOut");

  if (checkIn) checkIn.min = today;
  if (checkOut) checkOut.min = today;

  if (checkIn) checkIn.addEventListener("change", calculatePrice);
  if (checkOut) checkOut.addEventListener("change", calculatePrice);

  loadRooms();

  /* IMAGE PREVIEW */
  document.querySelectorAll(".card img").forEach(img => {
    img.addEventListener("click", () => openImage(img));
  });
});

/* LOAD ROOMS */
function loadRooms() {
  fetch(API + "/rooms")
    .then(res => res.json())
    .then(data => {
      data.forEach(room => {
        const btn = document.querySelector(`button[onclick="bookRoom(${room.id})"]`);
        if (btn) {
          const status = btn.parentElement.querySelector(".status");
          if (status) {
            status.innerText = room.status;
            status.className = "status " + room.status.toLowerCase();
          }
        }
      });
    });
}

/* PRICE CALC */
function calculatePrice() {
  const inDate = document.getElementById("checkIn").value;
  const outDate = document.getElementById("checkOut").value;

  if (!inDate || !outDate) return;

  const days = (new Date(outDate) - new Date(inDate)) / (1000 * 60 * 60 * 24);

  if (days <= 0) {
    document.getElementById("totalPrice").innerText = "Invalid dates";
    return;
  }

  const price = (roomPrices[selectedRoom] || 1000) * days;
  document.getElementById("totalPrice").innerText = "Total: ₹" + price;
}

/* SUBMIT BOOKING (NO ALERT → DIRECT SUCCESS PAGE) */
function submitBooking() {
  const name = document.getElementById("custName").value;
  const address = document.getElementById("custAddress").value;
  const age = document.getElementById("custAge").value;
  const check_in = document.getElementById("checkIn").value;
  const check_out = document.getElementById("checkOut").value;
  const booking_date = document.getElementById("bookingDate").value;

  if (!name || !address || !age || !check_in || !check_out) {
    alert("Fill all fields");
    return;
  }

  fetch(API + "/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: 1,
      room_id: selectedRoom,
      name,
      address,
      age,
      check_in,
      check_out,
      booking_date
    })
  })
  .then(res => res.json())
  .then(data => {

    localStorage.setItem("bookingData", JSON.stringify({
      bookingId: data.booking_id || Date.now(),
      name,
      address,
      age,
      room: selectedRoom,
      check_in,
      check_out,
      booking_date,
      price: document.getElementById("totalPrice").innerText
    }));

    closeForm();

    /* DIRECT REDIRECT */
    window.location.href = "success.html";
  })
  .catch(err => console.log(err));
}

/* CANCEL BOOKING */
function cancelBooking(roomId) {
  fetch(API + "/cancel-booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ room_id: roomId })
  })
  .then(res => res.json())
  .then(() => loadRooms());
}

/* IMAGE PREVIEW */
function openImage(img) {
  document.getElementById("previewImg").src = img.src;
  document.getElementById("imagePreview").style.display = "flex";
}

function closeImage() {
  document.getElementById("imagePreview").style.display = "none";
}