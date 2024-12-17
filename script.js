const canvas = document.getElementById("fireworksCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Firework System
class Firework {
  constructor(x, y) {
    this.x = x;
    this.y = canvas.height;
    this.targetY = y - Math.random() * 200 - 150;
    this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    this.trail = [];
    this.speedY = -8;
    this.exploded = false;
    this.particles = [];
  }

  update() {
    if (!this.exploded) {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 10) this.trail.shift();

      this.y += this.speedY;

      if (this.y <= this.targetY) {
        this.exploded = true;
        this.createParticles();
        this.playExplosionSound();
      }
    } else {
      this.particles.forEach((particle) => particle.update());
      this.particles = this.particles.filter((particle) => particle.alpha > 0);
    }
  }

  playExplosionSound() {
    const explosionSound = new Audio("audio/kembangapi.mp3");
    explosionSound.volume = 0.5;
    explosionSound.play();
  }

  createParticles() {
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = Math.random() * 3 + 2;
      const particle = new Particle(
        this.x,
        this.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        this.createGradient()
      );
      this.particles.push(particle);

      setTimeout(() => {
        particle.createMiniExplosion();
      }, Math.random() * 800 + 500);
    }
  }

  createGradient() {
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 50);
    const isRandom = Math.random() > 0.5;

    if (isRandom) {
      const baseColor = `hsl(${Math.random() * 360}, 80%, 70%)`; 
      const darkColor = `hsl(${Math.random() * 360}, 60%, 40%)`; 

      gradient.addColorStop(0, baseColor); 
      gradient.addColorStop(1, darkColor); 
    } else {
      const customColor1 = `hsl(45, 100%, 60%)`; 
      const customColor2 = `hsl(10, 100%, 50%)`; 

      gradient.addColorStop(0, customColor1); 
      gradient.addColorStop(1, customColor2);
    }
    return gradient;
  }

  draw() {
    if (!this.exploded) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();

      this.trail.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3 - index * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
      });
    } else {
      this.particles.forEach((particle) => particle.draw());
    }
  }

  isFinished() {
    return this.exploded && this.particles.length === 0;
  }
}

// Particle System
class Particle {
  constructor(x, y, speedX, speedY, color) {
    this.x = x;
    this.y = y;
    this.speedX = speedX;
    this.speedY = speedY;
    this.color = color;
    this.gravity = 0.05;
    this.alpha = 1;
    this.miniExplosions = [];
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += this.gravity;
    this.alpha -= 0.02;

    this.miniExplosions.forEach((miniExplosion) => miniExplosion.update());
    this.miniExplosions = this.miniExplosions.filter(
      (miniExplosion) => miniExplosion.alpha > 0
    );
  }

  // MiniExplosion System
  createMiniExplosion() {
    const miniExplosionCount = 3;
    for (let i = 0; i < miniExplosionCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.2 + 0.8;
      const miniExplosion = new MiniExplosion(
        this.x,
        this.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );

      setTimeout(() => {
        this.miniExplosions.push(miniExplosion);
      }, i * 50);
    }
  }

  draw() {
    if (this.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }

    this.miniExplosions.forEach((miniExplosion) => miniExplosion.draw());
  }
}

class MiniExplosion {
  constructor(x, y, speedX, speedY) {
    this.x = x;
    this.y = y;
    this.speedX = speedX;
    this.speedY = speedY;
    this.gravity = 0.05;
    this.alpha = 1;
    this.size = Math.random() * 1.5 + 0.5;
    const colorChoice = Math.random() > 0.5 ? "yellow-red" : "blue-yellow";

    if (colorChoice === "yellow-red") {
      this.color =
        Math.random() > 0.5
          ? `hsl(50, 100%, 30%)` 
          : `hsl(10, 100%, 30%)`; 
    } else if (colorChoice === "blue-yellow") {
      this.color =
        Math.random() > 0.5
          ? `hsl(200, 70%, 35%)` 
          : `hsl(45, 100%, 30%)`; 
    }
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += this.gravity;
    this.alpha -= 0.; 
  }

  draw() {
    if (this.alpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.restore();
    }
  }
}

const fireworks = [];

canvas.addEventListener("click", (e) => {
  const x = e.clientX;
  const y = e.clientY;

  const launchSound = new Audio("audio/kembangapi.mp3");
  launchSound.volume = 0.5;
  launchSound.play();

  fireworks.push(new Firework(x, y));
});

canvas.addEventListener("touchstart", (e) => {
  const x = e.touches[0].clientX;
  const y = e.touches[0].clientY;

  const launchSound = new Audio("audio/kembangapi.mp3");
  launchSound.volume = 0.5;
  launchSound.play();

  fireworks.push(new Firework(x, y));
});

function animate() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].draw();

    if (fireworks[i].isFinished()) {
      fireworks.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

animate();

// Stars Section
const starsContainer = document.querySelector(".stars");

function createStars() {
  const starCount = 120;

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement("div");
    star.classList.add("star");

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    const size = Math.random() * 2 + 1;
    const delay = Math.random() * 5 + 2 + "s";

    star.style.left = `${x}px`;
    star.style.top = `${y}px`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.animationDuration = delay;

    starsContainer.appendChild(star);
  }
}
createStars();

// Greeting Section
const greetingButton = document.querySelector(".greeting-button");
const greetingMessage = document.querySelector(".greeting-message");
const nameInput = document.querySelector(".name-input");
const submitNameButton = document.querySelector(".submit-name");
const backButton = document.querySelector(".back-button");
const messageContainer = document.querySelector(".message");
const subMessage = document.querySelector(".sub-message");

function generateGreeting(name) {
  const greetings = [
    `Happy New Year, ${name}! May 2025 be filled with joy, growth, and endless opportunities to achieve your dreams.`,
    `Cheers to a fresh start, ${name}! May this year bring you happiness, love, and the courage to pursue everything you've always wanted.`,
    `Happy 2025, ${name}! I hope this year brings new adventures, unforgettable memories, and the strength to face any challenges that come your way.`,
    `Welcome to 2025, ${name}! May this year open doors to new experiences and bring you closer to your dreams.`,
    `Here's to 2025, ${name}! May this year be full of new achievements, joyful moments, and the pursuit of all your passions.`,
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

greetingButton.addEventListener("click", () => {
  greetingButton.style.display = "none";
  nameInput.style.display = "block";
  submitNameButton.style.display = "block";
  backButton.style.display = "block";
  messageContainer.style.display = "none";
  subMessage.style.display = "none";
});

submitNameButton.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (name) {
    const randomGreeting = generateGreeting(name);
    greetingMessage.textContent = randomGreeting;
    nameInput.style.display = "none";
    submitNameButton.style.display = "none";
    backButton.style.display = "block";
    greetingMessage.style.display = "block";
  } else {
    greetingMessage.textContent = "Please enter your name!";
  }
});

backButton.addEventListener("click", () => {
  greetingButton.style.display = "block";
  nameInput.style.display = "none";
  submitNameButton.style.display = "none";
  backButton.style.display = "none";
  greetingMessage.textContent = "";
  messageContainer.style.display = "block";
  subMessage.style.display = "block";
});
