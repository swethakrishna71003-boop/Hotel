const API = "http://localhost:4000";

fetch(API + "/history")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("historyList");

    if (!data.length) {
      container.innerHTML = "<p>No bookings found</p>";
      return;
    }

    data.forEach(b => {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <h3>Room ${b.room_number}</h3>
        <p><b>Name:</b> ${b.name || "-"}</p>
        <p><b>Address:</b> ${b.address || "-"}</p>
        <p><b>Age:</b> ${b.age || "-"}</p>
        <p><b>Check-in:</b> ${b.check_in}</p>
        <p><b>Check-out:</b> ${b.check_out}</p>
        <p><b>Date:</b> ${b.booking_date || "-"}</p>
        <p class="status ${b.status.toLowerCase()}">${b.status}</p>
      `;

      container.appendChild(div);
    });
  });