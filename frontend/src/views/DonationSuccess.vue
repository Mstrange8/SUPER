<template>
  <div class="success-container">
    <div class="success-card">
      <div class="success-icon">✅</div>
      <h1>Thank You for Your Donation!</h1>
      <p class="success-message">
        Your generous contribution helps us maintain courts and organize events for the Sanpete County pickleball community.
      </p>

      <div v-if="donation" class="donation-details">
        <h3>Donation Details</h3>
        <div class="detail-row">
          <span class="label">Amount:</span>
          <span class="value">${{ (donation.amount / 100).toFixed(2) }}</span>
        </div>
        <div v-if="donation.donor_name" class="detail-row">
          <span class="label">Name:</span>
          <span class="value">{{ donation.donor_name }}</span>
        </div>
        <div v-if="donation.message" class="detail-row">
          <span class="label">Message:</span>
          <span class="value">{{ donation.message }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Date:</span>
          <span class="value">{{ formatDate(donation.created_at) }}</span>
        </div>
      </div>

      <div class="next-steps">
        <p>A receipt has been sent to your email (if provided).</p>
        <router-link to="/" class="btn-home">Return to Home</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { donationService } from '../services/donation.service';
import type { DonationRecord } from '../types/donation.types';

const route = useRoute();
const donation = ref<DonationRecord | null>(null);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

onMounted(async () => {
  const sessionId = route.query.session_id as string;
  if (sessionId) {
    try {
      donation.value = await donationService.getDonationBySession(sessionId);
    } catch (error) {
      console.error('Failed to fetch donation details:', error);
    }
  }
});
</script>

<style scoped>
.success-container {
  max-width: 600px;
  margin: 3rem auto;
  padding: 0 1rem;
}

.success-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 3rem 2rem;
  text-align: center;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.success-card h1 {
  color: #333;
  margin-bottom: 1rem;
}

.success-message {
  color: #666;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.donation-details {
  background: #f8f9ff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.donation-details h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  font-weight: 600;
  color: #666;
}

.detail-row .value {
  color: #333;
}

.next-steps {
  margin-top: 2rem;
}

.next-steps p {
  color: #666;
  margin-bottom: 1rem;
}

.btn-home {
  display: inline-block;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-home:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}
</style>
