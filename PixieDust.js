export default class PixieDust {
    constructor(x, y, direction, assetLoader) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.direction = direction; // 1 for right, -1 for left
        this.speed = 6;
        this.active = true;
        this.assetLoader = assetLoader;
        this.initialX = x;
        
        // Particle system properties
        this.particles = [];
        this.maxParticles = 20;
        this.particleLifespan = 1000; // 1 second
        this.spawnInterval = 50; // Spawn new particle every 50ms
        this.spawnTimer = 0;
        
        // For collision detection
        this.hitbox = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    update(deltaTime) {
        // Move the pixie dust in the throw direction
        this.x += this.speed * this.direction;
        
        // Update hitbox position
        this.hitbox.x = this.x;
        this.hitbox.y = this.y;
        
        // Update particle system
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval && this.particles.length < this.maxParticles) {
            this.spawnParticle();
            this.spawnTimer = 0;
        }
        
        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.life -= deltaTime;
            
            // Update particle position with some randomness
            particle.x += particle.vx + (Math.random() - 0.5) * 0.5;
            particle.y += particle.vy + (Math.random() - 0.5) * 0.5;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
        
        // Deactivate after traveling a certain distance
        if (Math.abs(this.x - this.initialX) > 400) {
            this.active = false;
        }
    }
    
    spawnParticle() {
        const colors = [
            'rgba(255, 192, 203, 0.8)', // Pink
            'rgba(255, 255, 224, 0.8)', // Light yellow
            'rgba(173, 216, 230, 0.8)', // Light blue
            'rgba(255, 182, 193, 0.8)'  // Light pink
        ];
        
        this.particles.push({
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: 2 + Math.random() * 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: this.particleLifespan
        });
    }
    
    checkEndermanCollision(enderman) {
        if (!this.active) return false;
        
        // Simple rectangular collision detection
        return (
            this.x < enderman.x + enderman.width &&
            this.x + this.width > enderman.x &&
            this.y < enderman.y + enderman.height &&
            this.y + this.height > enderman.y
        );
    }
    
    render(ctx, cameraOffset) {
        if (!this.active) return;
        
        const screenX = this.x - cameraOffset;
        
        // Don't render if off screen
        if (screenX < -this.width || screenX > ctx.canvas.width) {
            return;
        }
        
        ctx.save();
        
        // Render particles
        for (const particle of this.particles) {
            const particleX = particle.x - cameraOffset;
            const alpha = Math.min(1, particle.life / this.particleLifespan);
            
            ctx.fillStyle = particle.color.replace('0.8', alpha.toString());
            ctx.beginPath();
            ctx.arc(particleX, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add glow effect
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = 10;
            ctx.fill();
        }
        
        // Draw the main pixie dust effect
        ctx.shadowColor = 'rgba(255, 192, 203, 0.5)';
        ctx.shadowBlur = 15;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(screenX + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
} 