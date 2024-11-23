import { useEffect, useRef } from "react";

const Fireworks = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const PI2 = Math.PI * 2;
    const random = (min, max) => Math.random() * (max - min) + min;

    class Birthday {
      constructor() {
        this.resize();
        this.fireworks = [];
        this.counter = 0;
        window.addEventListener("resize", () => this.resize());
      }

      resize() {
        this.width = canvas.width = 600;
        this.height = canvas.height = 500;
        this.center = this.width / 2 | 0;
        this.spawnA = this.center - this.center / 4 | 0;
        this.spawnB = this.center + this.center / 4 | 0;
        this.spawnC = this.height * 0.1;
        this.spawnD = this.height * 0.5;
      }

      addFirework() {
        this.fireworks.push(new Firework(this));
      }

      update() {
        context.clearRect(0, 0, this.width, this.height);

        if (this.counter === 0) this.addFirework();

        this.counter = ++this.counter % 50; // Slow down firework launch rate

        this.fireworks = this.fireworks.filter(firework => firework.update());
      }
    }

    class Firework {
      constructor(birthday) {
        this.birthday = birthday;
        this.x = random(birthday.spawnA, birthday.spawnB);
        this.y = birthday.height;
        this.targetX = random(0, birthday.width);
        this.targetY = random(0, birthday.height / 2);
        this.sparks = [];
        this.exploded = false;
        this.tick = 0;
        this.totalTicks = 120; // Slow down firework ascent

        const burstType = Math.random() > 0.5 ? "random" : "all";
        const color = `hsl(${random(0, 360)}, 100%, 80%)`;

        for (let i = 0; i < 100; i++) {
          const sparkColor = burstType === "random" ? `hsl(${random(0, 360)}, 100%, 80%)` : color;
          this.sparks.push(new Spark(this.targetX, this.targetY, sparkColor));
        }
      }

      update() {
        if (!this.exploded) {
          this.tick++;
          if (this.tick >= this.totalTicks) {
            this.exploded = true;
          }

          const progress = this.tick / this.totalTicks;

          const x = this.x + (this.targetX - this.x) * progress;
          const y = this.y + (this.targetY - this.y) * progress;

          context.beginPath();
          context.arc(x, y, 2, 0, PI2);
          context.fillStyle = "white";
          context.fill();
        } else {
          this.sparks.forEach(spark => spark.update());
        }

        return this.exploded ? this.sparks.some(spark => spark.alive) : true;
      }
    }

    class Spark {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.angle = random(0, PI2);
        this.speed = random(0.5, 2); // Slow down secondary particles
        this.life = random(30, 70); // Increase lifespan for a more gradual fade
        this.alive = true;
        this.color = color;
      }

      update() {
        if (!this.alive) return;

        this.life--;
        if (this.life <= 0) {
          this.alive = false;
          return;
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        context.beginPath();
        context.arc(this.x, this.y, 1, 0, PI2); // Make particles thinner
        context.fillStyle = this.color;
        context.fill();
      }
    }

    const birthday = new Birthday();

    const animate = () => {
      birthday.update();
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", birthday.resize);
    };
  }, []);

  return <canvas ref={canvasRef}
                 // style={{ display: "block", backgroundColor: "black", width: "500px", height: "500px" }}
                 className="block opacity-90 w-[600px] h-[500px] rounded-xl bg-black"
  />;
};

export default Fireworks;
