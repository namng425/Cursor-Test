class Squirtle {
    constructor(box) {
        this.box = box;
        this.boxRect = box.getBoundingClientRect();
        this.element = document.createElement('div');
        this.element.className = 'squirtle';
        
        // Pre-create transform string for better performance
        this.transformPrefix = 'translate3d(';
        this.transformSuffix = 'px, 0) scale(2)';
        
        // Set initial position - start from a different position than Pikachu
        this.width = 80;
        this.height = 80;
        this.x = this.boxRect.width * 0.25; // Start from left quarter
        this.y = this.boxRect.height * 0.75; // Start from bottom quarter
        
        // Set initial speed (slightly different from Pikachu)
        this.speedX = (Math.random() * 2.5 + 0.8) * (Math.random() > 0.5 ? 1 : -1);
        this.speedY = (Math.random() * 2.5 + 0.8) * (Math.random() > 0.5 ? 1 : -1);
        
        // Store original speeds for velocity adjustments
        this.originalSpeedX = this.speedX;
        this.originalSpeedY = this.speedY;
        
        // Set mass for physics calculations (slightly higher than balls because Squirtle is larger)
        this.mass = 1.7;  // Slightly heavier than Pikachu
        
        // Set restitution (bounciness) property
        this.restitution = 0.8;  // Slightly less bouncy than Pikachu
        
        // For smoother animation
        this.prevX = this.x;
        this.prevY = this.y;
        
        this.updatePosition();
        box.appendChild(this.element);
    }
    
    updatePosition() {
        // Only update the DOM if position has changed significantly (reduce reflows)
        if (Math.abs(this.x - this.prevX) > 0.1 || Math.abs(this.y - this.prevY) > 0.1) {
            // Use template literals only once per frame for better performance
            const transform = `${this.transformPrefix}${this.x}px, ${this.y}${this.transformSuffix}`;
            this.element.style.transform = transform;
            
            this.prevX = this.x;
            this.prevY = this.y;
        }
    }
    
    move() {
        // Update position based on speed
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Bounce off the walls with proper physics
        if (this.x <= 0) {
            this.x = 0;
            this.speedX = Math.abs(this.speedX) * this.restitution;
        } else if (this.x >= this.boxRect.width - this.width) {
            this.x = this.boxRect.width - this.width;
            this.speedX = -Math.abs(this.speedX) * this.restitution;
        }
        
        if (this.y <= 0) {
            this.y = 0;
            this.speedY = Math.abs(this.speedY) * this.restitution;
        } else if (this.y >= this.boxRect.height - this.height) {
            this.y = this.boxRect.height - this.height;
            this.speedY = -Math.abs(this.speedY) * this.restitution;
        }
        
        // Apply a very small amount of friction/damping
        this.speedX *= 0.998;
        this.speedY *= 0.998;
        
        this.updatePosition();
    }
    
    // Get center coordinates and radius for collision detection
    getCollisionData() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            radius: Math.min(this.width, this.height) / 2
        };
    }
    
    // Apply an impulse for collision response
    applyImpulse(impulseX, impulseY) {
        this.speedX += impulseX / this.mass;
        this.speedY += impulseY / this.mass;
    }
    
    // Update Squirtle velocity based on the velocity multiplier
    updateVelocity(multiplier) {
        // Apply the multiplier to the original speeds
        this.speedX = this.originalSpeedX * multiplier;
        this.speedY = this.originalSpeedY * multiplier;
    }
} 