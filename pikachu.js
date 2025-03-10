class Pikachu {
    constructor(box) {
        this.box = box;
        this.boxRect = box.getBoundingClientRect();
        this.element = document.createElement('div');
        this.element.className = 'pikachu';
        
        // Set initial position
        this.width = 80;
        this.height = 80;
        this.x = (this.boxRect.width - this.width) / 2;
        this.y = (this.boxRect.height - this.height) / 2;
        
        // Set initial speed (slower than balls)
        this.speedX = (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1);
        this.speedY = (Math.random() * 2 + 1) * (Math.random() > 0.5 ? 1 : -1);
        
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