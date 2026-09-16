const times = Array.from({ length: 16 }, (_, index) => `${String(index + 7).padStart(2, '0')}:00`);
const courtNames = { poliesportiva: 'Poliesportiva', areia: 'Quadra de areia' };
const today = new Date();
let currentDate = new Date(today);
let currentCourt = 'poliesportiva';
let selectedTime = null;
let bookings = [
  { court: 'poliesportiva', time: '09:00', date: dateValue(today) },
  { court: 'poliesportiva', time: '18:00', date: dateValue(today) },
  { court: 'areia', time: '16:00', date: dateValue(today) }
];

const $ = (selector) => document.querySelector(selector);
const slotsElement = $('#slots');
const dateInput = $('#dateInput');
const dateLabel = $('#dateLabel');
const scheduleTitle = $('#scheduleTitle');
const availableCount = $('#availableCount');
const summaryCourt = $('#summaryCourt');
const summaryDate = $('#summaryDate');
const confirmButton = $('#confirmButton');
const nameInput = $('#nameInput');

function dateValue(date) { return date.toISOString().slice(0, 10); }
function prettyDate(date) { return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', ''); }
function isBooked(time) { return bookings.some((booking) => booking.court === currentCourt && booking.time === time && booking.date === dateValue(currentDate)); }
function updateDate() {
  dateInput.value = dateValue(currentDate);
  dateLabel.textContent = prettyDate(currentDate);
}
function updateReservationSummary() {
  summaryCourt.textContent = courtNames[currentCourt];
  summaryDate.textContent = selectedTime ? `${prettyDate(currentDate)} • ${selectedTime}` : 'Escolha na agenda';
  confirmButton.disabled = !(selectedTime && nameInput.value.trim());
}
function renderSlots() {
  slotsElement.innerHTML = '';
  let free = 0;
  times.forEach((time) => {
    const booked = isBooked(time);
    if (!booked) free += 1;
    const button = document.createElement('button');
    button.type = 'button';
    button.disabled = booked;
    button.className = selectedTime === time ? 'selected' : '';
    button.innerHTML = `<span class="slot-time">${time}</span><span class="slot-status">${booked ? 'RESERVADO' : selectedTime === time ? 'SELECIONADO' : 'LIVRE'}</span>`;
    button.addEventListener('click', () => { selectedTime = time; renderSlots(); updateReservationSummary(); $('#reservationForm').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    slotsElement.appendChild(button);
  });
  availableCount.textContent = `${free} horários livres`;
  scheduleTitle.textContent = `Horários — ${courtNames[currentCourt]}`;
}
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3500);
}
function selectCourt(court) {
  currentCourt = court;
  selectedTime = null;
  document.querySelectorAll('.court-card').forEach((card) => card.classList.toggle('active', card.dataset.court === court));
  document.querySelectorAll('.court-card').forEach((card) => {
    const selected = card.dataset.court === court;
    const oldLabel = card.querySelector('.selected-label');
    if (selected && !oldLabel) { const label = document.createElement('span'); label.className = 'selected-label'; label.textContent = 'SELECIONADA'; card.appendChild(label); }
    if (!selected && oldLabel) oldLabel.remove();
  });
  renderSlots();
  updateReservationSummary();
}

$('#previousDay').addEventListener('click', () => { currentDate.setDate(currentDate.getDate() - 1); selectedTime = null; updateDate(); renderSlots(); updateReservationSummary(); });
$('#nextDay').addEventListener('click', () => { currentDate.setDate(currentDate.getDate() + 1); selectedTime = null; updateDate(); renderSlots(); updateReservationSummary(); });
dateInput.addEventListener('change', (event) => { currentDate = new Date(`${event.target.value}T12:00:00`); selectedTime = null; updateDate(); renderSlots(); updateReservationSummary(); });
document.querySelectorAll('.court-card').forEach((card) => card.addEventListener('click', () => selectCourt(card.dataset.court)));
nameInput.addEventListener('input', updateReservationSummary);
confirmButton.addEventListener('click', () => {
  if (!selectedTime || !nameInput.value.trim()) return;
  bookings.push({ court: currentCourt, time: selectedTime, date: dateValue(currentDate) });
  showToast(`Horário reservado! ${courtNames[currentCourt]} • ${selectedTime} • ${nameInput.value.trim()}`);
  selectedTime = null;
  nameInput.value = '';
  renderSlots();
  updateReservationSummary();
});
$('#menuButton').addEventListener('click', () => $('#mobileNav').classList.toggle('open'));
document.querySelectorAll('.mobile-nav a').forEach((link) => link.addEventListener('click', () => $('#mobileNav').classList.remove('open')));

updateDate();
renderSlots();
updateReservationSummary();
