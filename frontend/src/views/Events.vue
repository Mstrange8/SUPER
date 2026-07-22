<template>
  <div class="events-container">
    <div class="events-header">
      <h1>📅 Events Calendar</h1>
      <div class="header-actions">
        <button
          v-if="authStore.isAdmin"
          @click="showCreateModal = true"
          class="btn-primary"
        >
          + Create Event
        </button>
      </div>
    </div>

    <div class="calendar-filters">
      <div class="filter-chips">
        <button
          v-for="(label, type) in eventTypeLabels"
          :key="type"
          :class="['filter-chip', { active: selectedTypes.includes(type) }]"
          :style="{ borderColor: eventTypeColors[type] }"
          @click="toggleFilter(type)"
        >
          <span
            class="chip-color"
            :style="{ backgroundColor: eventTypeColors[type] }"
          ></span>
          {{ label }}
        </button>
      </div>
    </div>

    <div class="calendar-wrapper">
      <FullCalendar :options="calendarOptions" ref="calendar" />
    </div>

    <!-- Create/Edit Event Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <h2>{{ showEditModal ? 'Edit Event' : 'Create Event' }}</h2>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="title">Event Title *</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              required
              placeholder="Enter event title"
            />
          </div>

          <div class="form-group">
            <label for="event_type">Event Type *</label>
            <select id="event_type" v-model="formData.event_type" @change="onEventTypeChange" required>
              <option value="">Select type...</option>
              <option value="signups">Signups</option>
              <option value="tournament">Tournament</option>
              <option value="league">League</option>
              <option value="roundRobin">Round Robin</option>
              <option value="kingsCourt">Kings Court</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="start_date">Start Date *</label>
              <input
                id="start_date"
                v-model="formData.start_date"
                type="date"
                required
              />
            </div>

            <div class="form-group">
              <label for="end_date">End Date</label>
              <input
                id="end_date"
                v-model="formData.end_date"
                type="date"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Repeats On</label>
            <select v-model="formData.recurrence_rule" multiple>
              <option value="su">Sunday</option>
              <option value="mo">Monday</option>
              <option value="tu">Tuesday</option>
              <option value="we">Wednesday</option>
              <option value="th">Thursday</option>
              <option value="fr">Friday</option>
              <option value="sa">Saturday</option>
            </select>
          </div>

          <div v-if="formData.recurrence_rule">
            <label>Repeat Until</label>
            <input
              type="date"
              v-model="formData.recurrence_end"
            />
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              v-model="formData.description"
              rows="4"
              placeholder="Event description..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="external_link">External Link</label>
            <input
              id="external_link"
              v-model="formData.external_link"
              type="url"
              placeholder="https://example.com/event"
            />
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>

          <div class="modal-actions">
            <button type="button" @click="closeModals" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="loading" class="btn-primary">
              {{ loading ? 'Saving...' : showEditModal ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Event Details Modal -->
    <div v-if="showDetailsModal && selectedEvent" class="modal-overlay" @click="closeModals">
      <div class="modal-content" @click.stop>
        <h2>{{ selectedEvent.title }}</h2>
        
        <div class="event-details">
          <div class="detail-row">
            <strong>Type:</strong>
            <span
              class="event-type-badge"
              :style="{ backgroundColor: selectedEvent.color }"
            >
              {{ eventTypeLabels[selectedEvent.event_type] }}
            </span>
          </div>

          <div class="detail-row">
            <strong>Start:</strong>
            <span>{{ formatDate(selectedEvent.start_date) }}</span>
          </div>

          <div v-if="selectedEvent.end_date" class="detail-row">
            <strong>End:</strong>
            <span>{{ formatDate(selectedEvent.end_date) }}</span>
          </div>

          <div v-else-if="selectedEvent.recurrence_end" class="detail-row">
            <strong>End:</strong>
            <span>{{ formatDate(selectedEvent.recurrence_end) }}</span>
          </div>

          <div v-if="selectedEvent.recurrence_rule" class="detail-row">
            <strong>Recurring Days:</strong>
            <span>{{ formatDays(selectedEvent.recurrence_rule) }}</span>
          </div>

          <div v-if="selectedEvent.description" class="detail-row">
            <strong>Description:</strong>
            <p>{{ selectedEvent.description }}</p>
          </div>

          <div v-if="selectedEvent.external_link" class="detail-row">
            <strong>Link:</strong>
            <a :href="selectedEvent.external_link" target="_blank" rel="noopener">
              {{ selectedEvent.external_link }}
            </a>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="closeModals" class="btn-secondary">Close</button>
          <template v-if="authStore.isAdmin">
            <button @click="editEvent(selectedEvent)" class="btn-primary">Edit</button>
            <button @click="deleteEventConfirm(selectedEvent.id)" class="btn-danger">
              Delete
            </button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { useEventStore } from '../stores/event.store';
import { useAuthStore } from '../stores/auth.store';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, type Event } from '../services/event.service';

const eventStore = useEventStore();
const authStore = useAuthStore();

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDetailsModal = ref(false);
const selectedEvent = ref<Event | null>(null);
const selectedTypes = ref(['signups', 'tournament', 'league', 'roundRobin', 'kingsCourt', 'other']);
const loading = ref(false);
const error = ref('');

const eventTypeColors = EVENT_TYPE_COLORS;
const eventTypeLabels = EVENT_TYPE_LABELS;

const formData = ref({
  title: '',
  description: '',
  event_type: '',
  start_date: '',
  end_date: '',
  recurrence_rule: [] as string[],
  recurrence_end: '',
  external_link: '',
  color: '',
});

const onEventTypeChange = () => {
  if (formData.value.event_type && eventTypeColors[formData.value.event_type]) {
    formData.value.color = eventTypeColors[formData.value.event_type];
  }
};

const filteredEvents = computed(() => {
  if (selectedTypes.value.length === 0) {
    return eventStore.events;
  }
  return eventStore.events.filter(event =>
    selectedTypes.value.includes(event.event_type)
  );
});

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay',
  },
  events: filteredEvents.value.map(event => {
    console.log('testing');
    console.log(event.recurrence_rule);
    if (event.recurrence_rule && event.recurrence_rule.length > 0) {
      
      
      return {
        id: event.id.toString(),
        title: event.title,
        rrule: {
          freq: 'weekly',
          byweekday: event.recurrence_rule,
          dtstart: event.start_date,
          until: event.recurrence_end ? addOneDay(event.recurrence_end) : undefined,
        },
        allDay: true,
        backgroundColor: event.color,
        borderColor: event.color,
        extendedProps: event,
      };
    }

    return {
      id: event.id.toString(),
      title: event.title,
      start: event.start_date,
      end: event.end_date ? addOneDay(event.end_date) : undefined,
      allDay: true,
      backgroundColor: event.color,
      borderColor: event.color,
      extendedProps: event,
    };
  }),
  eventClick: (info: any) => {
    selectedEvent.value = info.event.extendedProps as Event;
    showDetailsModal.value = true;
  },
  editable: false,
  selectable: false,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  height: 'auto',
}));

const toggleFilter = (type: string) => {
  const index = selectedTypes.value.indexOf(type);
  if (index > -1) {
    selectedTypes.value.splice(index, 1);
  } else {
    selectedTypes.value.push(type);
  }
};

const closeModals = () => {
  showCreateModal.value = false;
  showEditModal.value = false;
  showDetailsModal.value = false;
  selectedEvent.value = null;
  resetForm();
};

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    event_type: '',
    start_date: '',
    end_date: '',
    recurrence_rule: [] as string[],
    recurrence_end: '',
    external_link: '',
    color: '',
  };
  error.value = '';
};

const editEvent = (event: Event) => {
  selectedEvent.value = event;

  console.log(event);
  
  formData.value = {
    title: event.title,
    description: event.description || '',
    event_type: event.event_type,
    start_date: event.start_date,
    end_date: event.end_date || '',
    recurrence_rule: event.recurrence_rule || [],
    recurrence_end: event.recurrence_end || '',
    external_link: event.external_link || '',
    color: event.color,
  };

  console.log(formData);
  showDetailsModal.value = false;
  showEditModal.value = true;
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';

  console.log(formData);

  // Convert datetime-local to ISO string (keeps local timezone, browser will send as UTC)
  const submitData = {
    ...formData.value,
    start_date: formData.value.start_date,
    end_date: formData.value.end_date || undefined,
    recurrence_end: formData.value.recurrence_end || undefined,
    color: eventTypeColors[formData.value.event_type] || '#607D8B'
  };

  try {
    if (showEditModal.value && selectedEvent.value) {
      await eventStore.updateEvent(selectedEvent.value.id, submitData as any);
    } else {

      await eventStore.createEvent(submitData as any);
    }
    closeModals();
  } catch (err: any) {
    error.value = err.message || 'Failed to save event';
  } finally {
    loading.value = false;
  }
};

const deleteEventConfirm = async (id: number) => {
  if (confirm('Are you sure you want to delete this event?')) {
    try {
      await eventStore.deleteEvent(id);
      closeModals();
    } catch (err: any) {
      error.value = err.message || 'Failed to delete event';
    }
  }
};

const addOneDay = (dateString: string) => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + 1);

  return date.toISOString().split('T')[0];
};

const formatDate = (dateStr: string) => {
  return dateStr.split("T")[0];
};

const formatDays = (days: string[]) => {
  const dayMap: Record<string, string> = {
    su: 'Sunday',
    mo: 'Monday',
    tu: 'Tuesday',
    we: 'Wednesday',
    th: 'Thursday',
    fr: 'Friday',
    sa: 'Saturday',
  };
  return ` ${days.map(day => dayMap[day]).join(', ')}`;
}

onMounted(async () => {
  await eventStore.fetchEvents();
});
</script>

<style scoped>
.events-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.events-header h1 {
  margin: 0;
  color: #333;
}

.calendar-filters {
  margin-bottom: 2rem;
}

.filter-chips {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-chip.active {
  background: #f5f5f5;
  border-width: 3px;
}

.chip-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.calendar-wrapper {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin-top: 0;
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

input, select, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #4CAF50;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #45a049;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-danger:hover {
  background-color: #da190b;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.event-details {
  margin: 1.5rem 0;
}

.detail-row {
  margin-bottom: 1rem;
}

.detail-row strong {
  display: inline-block;
  min-width: 100px;
  color: #555;
}

.detail-row p {
  margin: 0.5rem 0 0 0;
  color: #666;
}

.event-type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  color: white;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .events-container {
    padding: 1rem;
  }

  .events-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
  }
}
</style>
