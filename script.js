document.addEventListener('DOMContentLoaded', () => {
    const box = document.getElementById('box');
    const boxRect = box.getBoundingClientRect();
    const ballSize = 40; // Size of the balls in pixels
    const ballCount = 6; // Number of balls
    const balls = [];
    
    // Create Pikachu
    const pikachu = new Pikachu(box);
    
    // Create Squirtle
    const squirtle = new Squirtle(box);
    
    // Colors for the balls
    const colors = [
        '#FF5252', // Red
        '#FFEB3B', // Yellow
        '#4CAF50', // Green
        '#2196F3', // Blue
        '#9C27B0', // Purple
        '#FF9800'  // Orange
    ];
    
    // Ball class to manage each ball's properties and movement
    class Ball {
        constructor(id, color) {
            this.id = id;
            this.element = document.createElement('div');
            this.element.className = 'ball';
            this.element.style.backgroundColor = color;
            
            // Random initial position within the box
            this.x = Math.random() * (boxRect.width - ballSize);
            this.y = Math.random() * (boxRect.height - ballSize);
            
            // Random speed between 2 and 5 pixels per frame
            this.speedX = (Math.random() * 3 + 2) * (Math.random() > 0.5 ? 1 : -1);
            this.speedY = (Math.random() * 3 + 2) * (Math.random() > 0.5 ? 1 : -1);
            
            // Mass (for physics calculations)
            this.mass = 1;
            
            // Set initial position
            this.updatePosition();
            
            // Add to the box
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
            if (this.x <= 0 || this.x >= boxRect.width - ballSize) {
                this.speedX *= -1;
                this.x = Math.max(0, Math.min(this.x, boxRect.width - ballSize));
            }
            
            if (this.y <= 0 || this.y >= boxRect.height - ballSize) {
                this.speedY *= -1;
                this.y = Math.max(0, Math.min(this.y, boxRect.height - ballSize));
            }
            
            this.updatePosition();
        }
        
        // Get center coordinates and radius for collision detection
        getCollisionData() {
            return {
                x: this.x + ballSize / 2,
                y: this.y + ballSize / 2,
                radius: ballSize / 2
            };
        }
    }
    
    // Create the balls
    for (let i = 0; i < ballCount; i++) {
        balls.push(new Ball(i, colors[i % colors.length]));
    }
    
    // Check for collisions between balls
    function checkCollisions() {
        // Check collisions between balls
        for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                const ball1 = balls[i];
                const ball2 = balls[j];
                
                // Get collision data
                const b1 = ball1.getCollisionData();
                const b2 = ball2.getCollisionData();
                
                // Calculate distance between centers
                const dx = b2.x - b1.x;
                const dy = b2.y - b1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Check if balls are colliding
                if (distance < b1.radius + b2.radius) {
                    // Calculate collision normal
                    const nx = dx / distance;
                    const ny = dy / distance;
                    
                    // Calculate relative velocity
                    const vx = ball2.speedX - ball1.speedX;
                    const vy = ball2.speedY - ball1.speedY;
                    
                    // Calculate relative velocity in terms of the normal direction
                    const velocityAlongNormal = vx * nx + vy * ny;
                    
                    // Do not resolve if velocities are separating
                    if (velocityAlongNormal > 0) {
                        continue;
                    }
                    
                    // Calculate restitution (bounciness)
                    const restitution = 0.9;
                    
                    // Calculate impulse scalar
                    let j = -(1 + restitution) * velocityAlongNormal;
                    j /= 1 / ball1.mass + 1 / ball2.mass;
                    
                    // Apply impulse
                    const impulseX = j * nx;
                    const impulseY = j * ny;
                    
                    ball1.speedX -= impulseX / ball1.mass;
                    ball1.speedY -= impulseY / ball1.mass;
                    ball2.speedX += impulseX / ball2.mass;
                    ball2.speedY += impulseY / ball2.mass;
                    
                    // Move balls apart to prevent sticking
                    const overlap = (b1.radius + b2.radius) - distance;
                    const moveX = overlap * nx * 0.5;
                    const moveY = overlap * ny * 0.5;
                    
                    ball1.x -= moveX;
                    ball1.y -= moveY;
                    ball2.x += moveX;
                    ball2.y += moveY;
                }
            }
            
            // Check collision with Pikachu
            const ball = balls[i];
            const ballData = ball.getCollisionData();
            const pikachuData = pikachu.getCollisionData();
            
            const dx = pikachuData.x - ballData.x;
            const dy = pikachuData.y - ballData.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < ballData.radius + pikachuData.radius) {
                // Simple bounce effect for Pikachu collisions
                const nx = dx / distance;
                const ny = dy / distance;
                
                // Reverse ball direction with some randomness
                ball.speedX = -ball.speedX * 0.9 + (Math.random() * 0.4 - 0.2);
                ball.speedY = -ball.speedY * 0.9 + (Math.random() * 0.4 - 0.2);
                
                // Move ball away from Pikachu to prevent sticking
                const overlap = (ballData.radius + pikachuData.radius) - distance;
                ball.x -= overlap * nx * 1.1;
                ball.y -= overlap * ny * 1.1;
            }
            
            // Check collision with Squirtle
            const squirtleData = squirtle.getCollisionData();
            
            const dxSquirtle = squirtleData.x - ballData.x;
            const dySquirtle = squirtleData.y - ballData.y;
            const distanceSquirtle = Math.sqrt(dxSquirtle * dxSquirtle + dySquirtle * dySquirtle);
            
            if (distanceSquirtle < ballData.radius + squirtleData.radius) {
                // Simple bounce effect for Squirtle collisions
                const nx = dxSquirtle / distanceSquirtle;
                const ny = dySquirtle / distanceSquirtle;
                
                // Reverse ball direction with some randomness
                ball.speedX = -ball.speedX * 0.95 + (Math.random() * 0.5 - 0.25);
                ball.speedY = -ball.speedY * 0.95 + (Math.random() * 0.5 - 0.25);
                
                // Move ball away from Squirtle to prevent sticking
                const overlap = (ballData.radius + squirtleData.radius) - distanceSquirtle;
                ball.x -= overlap * nx * 1.1;
                ball.y -= overlap * ny * 1.1;
            }
        }
        
        // Check collision between Pikachu and Squirtle
        const pikachuData = pikachu.getCollisionData();
        const squirtleData = squirtle.getCollisionData();
        
        const dx = squirtleData.x - pikachuData.x;
        const dy = squirtleData.y - pikachuData.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < pikachuData.radius + squirtleData.radius) {
            // Calculate collision normal
            const nx = dx / distance;
            const ny = dy / distance;
            
            // Simple bounce effect for Pokémon collisions
            pikachu.speedX = -pikachu.speedX * 0.8 + (Math.random() * 0.3 - 0.15);
            pikachu.speedY = -pikachu.speedY * 0.8 + (Math.random() * 0.3 - 0.15);
            
            squirtle.speedX = -squirtle.speedX * 0.8 + (Math.random() * 0.3 - 0.15);
            squirtle.speedY = -squirtle.speedY * 0.8 + (Math.random() * 0.3 - 0.15);
            
            // Move Pokémon apart to prevent sticking
            const overlap = (pikachuData.radius + squirtleData.radius) - distance;
            pikachu.x -= overlap * nx * 0.5;
            pikachu.y -= overlap * ny * 0.5;
            squirtle.x += overlap * nx * 0.5;
            squirtle.y += overlap * ny * 0.5;
        }
    }
    
    // Animation loop
    function animate() {
        // Move all balls
        for (const ball of balls) {
            ball.move();
        }
        
        // Move Pikachu
        pikachu.move();
        
        // Move Squirtle
        squirtle.move();
        
        // Check for collisions
        checkCollisions();
        
        requestAnimationFrame(animate);
    }
    
    // Start the animation
    animate();
    
    // Handle window resize to update box dimensions
    window.addEventListener('resize', () => {
        const newBoxRect = box.getBoundingClientRect();
        
        // Update box dimensions
        boxRect.width = newBoxRect.width;
        boxRect.height = newBoxRect.height;
        
        // Update Pikachu's box dimensions
        pikachu.boxRect = newBoxRect;
        
        // Ensure balls stay within the new boundaries
        balls.forEach(ball => {
            ball.x = Math.min(ball.x, boxRect.width - ballSize);
            ball.y = Math.min(ball.y, boxRect.height - ballSize);
            ball.updatePosition();
        });
        
        // Ensure Pikachu stays within the new boundaries
        pikachu.x = Math.min(pikachu.x, boxRect.width - pikachu.width);
        pikachu.y = Math.min(pikachu.y, boxRect.height - pikachu.height);
        pikachu.updatePosition();
    });
}); 