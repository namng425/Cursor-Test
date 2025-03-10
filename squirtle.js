class Squirtle {
    constructor(box) {
        this.box = box;
        this.boxRect = box.getBoundingClientRect();
        this.element = document.createElement('div');
        this.element.className = 'squirtle';
        
        // Set initial position - start from a different position than Pikachu
        this.width = 80;
        this.height = 80;
        this.x = this.boxRect.width * 0.25; // Start from left quarter
        this.y = this.boxRect.height * 0.75; // Start from bottom quarter
        
        // Set initial speed (slightly different from Pikachu)
        this.speedX = (Math.random() * 2.5 + 0.8) * (Math.random() > 0.5 ? 1 : -1);
        this.speedY = (Math.random() * 2.5 + 0.8) * (Math.random() > 0.5 ? 1 : -1);
        
        this.updatePosition();
        box.appendChild(this.element);
    }
    
    updatePosition() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
    
    move() {
        // Update position based on speed
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Bounce off the walls
        if (this.x <= 0 || this.x >= this.boxRect.width - this.width) {
            this.speedX *= -1;
            this.x = Math.max(0, Math.min(this.x, this.boxRect.width - this.width));
        }
        
        if (this.y <= 0 || this.y >= this.boxRect.height - this.height) {
            this.speedY *= -1;
            this.y = Math.max(0, Math.min(this.y, this.boxRect.height - this.height));
        }
        
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
} 