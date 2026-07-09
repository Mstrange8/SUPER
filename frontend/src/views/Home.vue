<script setup lang="ts">
  import homeImage from '../assets/home_image.jpg'
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="orange">S</span><span class="teal">ANPETE</span><br>
          <span class="orange">U</span><span class="teal">TAH</span><br>
          <span class="orange">P</span><span class="teal">ICKLEBALL</span><br>
          <span class="orange">E</span><span class="teal">VENT</span><br>
          <span class="orange">R</span><span class="teal">ESOURCE</span>
        </h1>
      </div>
    </section>

    <!-- Full Width Image with Overlay -->
    <section class="image-divider-section">
      <div class="full-width-image">
        <img :src="homeImage" class="home_image" alt="Home image" width=100% height=100%/>
      </div>
      <div class="overlay-container">
        <div class="mission-box">
          <p class="mission-text">
            Empowering the Sanpete community with the tools you need to find your court and connect with fellow players.
          </p>
          <div class="cta-buttons">
            <router-link to="/events" class="btn-primary">EXPLORE EVENTS</router-link>
            <router-link to="/courts" class="btn-secondary">FIND A COURT</router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Support Section -->
    <section class="support-section">
      <h2 class="support-title">
        <span class="teal">SUPPORT</span> <span class="orange">SUPER</span><br>
        <span class="teal">PICKLEBALL</span>
      </h2>
      <p class="support-text">
        Your donations help fund this site so players can stay connected to local pickleball events, leagues, and programs across Sanpete County.
      </p>
      <router-link to="/donate" class="btn-primary">DONATE NOW</router-link>
    </section>
  </div>
</template>

<style scoped>
.home {
  width: 100%;
}

.hero {
  background: var(--color-background);
  padding: 4rem 2rem 2rem;
}

.hero-content {
  max-width: 1400px;
  margin: 0 auto;
}

.hero-title {
  font-size: clamp(3rem, 8vw, 6rem);
  font-weight: 700;
  line-height: 1.1;
  margin: 0;
  letter-spacing: -2px;
}

.hero-title .orange {
  color: var(--color-primary);
}

.hero-title .teal {
  color: var(--color-secondary);
}

.image-divider-section {
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0;
}

.full-width-image {
  width: 100%;
  height: 500px;
  background: linear-gradient(135deg, #B8D4E8 0%, #A8C7DB 100%);
  position: relative;
  margin-top: 4rem;
}

.full-width-image::after {
  position: absolute;
  font-size: 12rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.15;
}

.overlay-container {
  position: absolute;
  top: 0;
  left: 5rem;

  bottom: 0;
  display: flex;
  align-items: center;
  padding: 2rem;
}

.mission-box {
  background: var(--color-surface);
  padding: 3rem;
  border: 3px solid var(--color-secondary);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.mission-text {
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--color-secondary);
  margin-bottom: 2rem;
  font-weight: 500;
}

.cta-buttons {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: 1rem 2rem;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  transition: all var(--transition-base);
  display: inline-block;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
}

.btn-secondary {
  background: transparent;
  color: var(--color-primary);
  border: 3px solid var(--color-primary);
  padding: 1rem 2rem;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  transition: all var(--transition-base);
  display: inline-block;
}

.btn-secondary:hover {
  background: var(--color-primary);
  color: white;
  transform: translateY(-2px);
}

.support-section {
  background: var(--color-background);
  padding: 5rem 2rem;
  text-align: left;
  max-width: 1400px;
  margin: 0 auto;
}

.support-title {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 2rem;
}

.support-title .teal {
  color: var(--color-secondary);
}

.support-title .orange {
  color: var(--color-primary);
}

.support-text {
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--color-secondary);
  margin-bottom: 2.5rem;
  max-width: 800px;
}

@media (max-width: 968px) {
  .hero {
    padding: 2rem 1rem;
  }

  .hero-title {
    font-size: clamp(2rem, 10vw, 4rem);
  }

  .full-width-image {
    height: 400px;
  }

  .full-width-image::after {
    font-size: 8rem;
  }

  .overlay-container {
    padding: 1rem;
  }

  .mission-box {
    padding: 2rem;
    max-width: 100%;
  }

  .cta-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    text-align: center;
    width: 100%;
  }

  .support-section {
    padding: 3rem 1rem;
  }
}
</style>
