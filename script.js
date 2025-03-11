document.addEventListener('DOMContentLoaded', () => {
    // Polyfill for requestAnimationFrame for older browsers
    const requestAnimFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(callback) {
            window.setTimeout(callback, 1000 / 60);
        };
    
    const box = document.getElementById('box');
    const boxRect = box.getBoundingClientRect();
    const ballSize = 40; // Size of the balls in pixels
    const ballCount = 6; // Number of balls
    const balls = [];
    
    // Velocity control elements
    const velocitySlider = document.getElementById('velocity-slider');
    const velocityValue = document.getElementById('velocity-value');
    const resetVelocityBtn = document.getElementById('reset-velocity');
    
    // Velocity multiplier - we'll use this to adjust speeds
    let velocityMultiplier = 1.0;
    
    // Store original speeds for each ball
    const originalSpeeds = [];
    
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
            
            // Pre-create transform string parts for better performance
            this.transformPrefix = 'translate3d(';
            this.transformSuffix = 'px, 0)';
            
            // Random initial position within the box
            this.x = Math.random() * (boxRect.width - ballSize);
            this.y = Math.random() * (boxRect.height - ballSize);
            
            // Random speed between 2 and 5 pixels per frame
            this.speedX = (Math.random() * 3 + 2) * (Math.random() > 0.5 ? 1 : -1);
            this.speedY = (Math.random() * 3 + 2) * (Math.random() > 0.5 ? 1 : -1);
            
            // Store original speeds
            this.originalSpeedX = this.speedX;
            this.originalSpeedY = this.speedY;
            
            // Mass (for physics calculations)
            this.mass = 1;
            
            // For smoother animation
            this.prevX = this.x;
            this.prevY = this.y;
            
            // Set initial position
            this.updatePosition();
            
            // Add to the box
            box.appendChild(this.element);
            
            // Store original speeds in the array
            originalSpeeds.push({
                id: this.id,
                speedX: this.speedX,
                speedY: this.speedY
            });
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
            // Update position based on speed (velocity is now pre-adjusted)
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
        
        // Update ball velocity based on the velocity multiplier
        updateVelocity(multiplier) {
            // Apply the multiplier to the original speeds
            this.speedX = this.originalSpeedX * multiplier;
            this.speedY = this.originalSpeedY * multiplier;
        }
        
        // Reset ball velocity to original speeds
        resetVelocity() {
            this.speedX = this.originalSpeedX;
            this.speedY = this.originalSpeedY;
        }
    }
    
    // Create the balls
    for (let i = 0; i < ballCount; i++) {
        balls.push(new Ball(i, colors[i % colors.length]));
    }
    
    // Initialize velocities with current multiplier
    updateAllVelocities();
    
    // Add touch events for better mobile support
    velocitySlider.addEventListener('touchstart', function(e) {
        e.preventDefault(); // Prevent scrolling when touching the slider
    });
    
    // Handle standard input events (mouse/keyboard)
    velocitySlider.addEventListener('input', throttle(function() {
        const newValue = parseFloat(this.value);
        
        // Only update if value has actually changed
        if (velocityMultiplier !== newValue) {
            velocityMultiplier = newValue;
            velocityValue.textContent = velocityMultiplier.toFixed(1) + 'x';
            
            // Apply velocity changes to all objects at once
            updateAllVelocities();
        }
    }, 16)); // Throttle to roughly 60fps (16ms)
    
    velocitySlider.addEventListener('touchmove', throttle(function(e) {
        e.preventDefault();
        const newValue = parseFloat(this.value);
        
        if (velocityMultiplier !== newValue) {
            velocityMultiplier = newValue;
            velocityValue.textContent = velocityMultiplier.toFixed(1) + 'x';
            updateAllVelocities();
        }
    }, 16));
    
    // Optimization: Pre-calculate squared radius for faster collision checks
    const ballRadiusSquared = Math.pow(ballSize / 2, 2);
    
    // Simple spatial partitioning system for faster collision detection
    const GRID_SIZE = 100; // Size of each grid cell
    function getGridCell(x, y) {
        return `${Math.floor(x / GRID_SIZE)},${Math.floor(y / GRID_SIZE)}`;
    }
    
    // Check for collisions between balls
    function checkCollisions() {
        // Create spatial grid for this frame
        const spatialGrid = {};
        
        // Place all balls in the grid
        for (let i = 0; i < balls.length; i++) {
            const ball = balls[i];
            const ballData = ball.getCollisionData();
            const gridCell = getGridCell(ballData.x, ballData.y);
            
            if (!spatialGrid[gridCell]) {
                spatialGrid[gridCell] = [];
            }
            
            spatialGrid[gridCell].push({
                index: i,
                data: ballData
            });
        }
        
        // Check collisions for each ball
        for (let i = 0; i < balls.length; i++) {
            const ball1 = balls[i];
            const b1 = ball1.getCollisionData();
            const ball1Cell = getGridCell(b1.x, b1.y);
            
            // Check nearby grid cells (current cell and 8 surrounding cells)
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const checkCell = getGridCell(b1.x + dx * GRID_SIZE, b1.y + dy * GRID_SIZE);
                    
                    if (spatialGrid[checkCell]) {
                        // Check collision with balls in this cell
                        for (const item of spatialGrid[checkCell]) {
                            // Skip self and already checked pairs
                            if (item.index <= i) continue;
                            
                            const ball2 = balls[item.index];
                            const b2 = item.data;
                            
                            // Calculate distance between centers
                            const dx = b2.x - b1.x;
                            const dy = b2.y - b1.y;
                            
                            // Optimization: Use squared distance to avoid expensive sqrt operation
                            const distanceSquared = dx * dx + dy * dy;
                            const minDistanceSquared = Math.pow(b1.radius + b2.radius, 2);
                            
                            // Check if balls are colliding
                            if (distanceSquared < minDistanceSquared) {
                                // Calculate actual distance only when needed
                                const distance = Math.sqrt(distanceSquared);
                                
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
                                
                                // Calculate combined restitution (bounciness)
                                const restitution = 0.85;
                                
                                // Calculate impulse scalar
                                let j = -(1 + restitution) * velocityAlongNormal;
                                j /= 1 / ball1.mass + 1 / ball2.mass;
                                
                                // Apply impulse
                                const impulseX = j * nx;
                                const impulseY = j * ny;
                                
                                // Apply impulses using the new method
                                ball1.speedX -= impulseX / ball1.mass;
                                ball1.speedY -= impulseY / ball1.mass;
                                ball2.speedX += impulseX / ball2.mass;
                                ball2.speedY += impulseY / ball2.mass;
                                
                                // Move apart to prevent sticking
                                const overlap = (b1.radius + b2.radius) - distance;
                                const moveX = overlap * nx * 0.5;
                                const moveY = overlap * ny * 0.5;
                                
                                // Adjust position based on mass ratio
                                const ball1Ratio = ball2.mass / (ball1.mass + ball2.mass);
                                const ball2Ratio = ball1.mass / (ball1.mass + ball2.mass);
                                
                                ball1.x -= moveX * ball1Ratio;
                                ball1.y -= moveY * ball1Ratio;
                                ball2.x += moveX * ball2Ratio;
                                ball2.y += moveY * ball2Ratio;
                            }
                        }
                    }
                }
            }
            
            // Check collision with Pikachu
            const pikachuData = pikachu.getCollisionData();
            
            const dxPikachu = pikachuData.x - b1.x;
            const dyPikachu = pikachuData.y - b1.y;
            
            // Optimization: Use squared distance
            const distancePikachuSquared = dxPikachu * dxPikachu + dyPikachu * dyPikachu;
            const minDistancePikachuSquared = Math.pow(b1.radius + pikachuData.radius, 2);
            
            if (distancePikachuSquared < minDistancePikachuSquared) {
                const distance = Math.sqrt(distancePikachuSquared);
                
                // Calculate collision normal
                const nx = dxPikachu / distance;
                const ny = dyPikachu / distance;
                
                // Calculate relative velocity
                const vx = pikachu.speedX - ball1.speedX;
                const vy = pikachu.speedY - ball1.speedY;
                
                // Calculate relative velocity in terms of the normal direction
                const velocityAlongNormal = vx * nx + vy * ny;
                
                // Do not resolve if velocities are separating
                if (velocityAlongNormal > 0) {
                    continue;
                }
                
                // Calculate combined restitution (bounciness)
                const restitution = 0.85;
                
                // Calculate impulse scalar
                let j = -(1 + restitution) * velocityAlongNormal;
                j /= 1 / ball1.mass + 1 / pikachu.mass;
                
                // Apply impulse
                const impulseX = j * nx;
                const impulseY = j * ny;
                
                // Apply impulses using the new method
                ball1.speedX -= impulseX / ball1.mass;
                ball1.speedY -= impulseY / ball1.mass;
                pikachu.applyImpulse(impulseX, impulseY);
                
                // Move apart to prevent sticking
                const overlap = (b1.radius + pikachuData.radius) - distance;
                const moveX = overlap * nx * 0.5;
                const moveY = overlap * ny * 0.5;
                
                // Adjust position based on mass ratio
                const ball1Ratio = pikachu.mass / (ball1.mass + pikachu.mass);
                const pikachuRatio = ball1.mass / (ball1.mass + pikachu.mass);
                
                ball1.x -= moveX * ball1Ratio;
                ball1.y -= moveY * ball1Ratio;
                pikachu.x += moveX * pikachuRatio;
                pikachu.y += moveY * pikachuRatio;
            }
            
            // Check collision with Squirtle
            const squirtleData = squirtle.getCollisionData();
            
            const dxSquirtle = squirtleData.x - b1.x;
            const dySquirtle = squirtleData.y - b1.y;
            
            // Optimization: Use squared distance
            const distanceSquirtleSquared = dxSquirtle * dxSquirtle + dySquirtle * dySquirtle;
            const minDistanceSquirtleSquared = Math.pow(b1.radius + squirtleData.radius, 2);
            
            if (distanceSquirtleSquared < minDistanceSquirtleSquared) {
                const distanceSquirtle = Math.sqrt(distanceSquirtleSquared);
                
                // Calculate collision normal
                const nx = dxSquirtle / distanceSquirtle;
                const ny = dySquirtle / distanceSquirtle;
                
                // Calculate relative velocity
                const vx = squirtle.speedX - ball1.speedX;
                const vy = squirtle.speedY - ball1.speedY;
                
                // Calculate relative velocity in terms of the normal direction
                const velocityAlongNormal = vx * nx + vy * ny;
                
                // Do not resolve if velocities are separating
                if (velocityAlongNormal > 0) {
                    continue;
                }
                
                // Calculate combined restitution (bounciness)
                const restitution = 0.8;
                
                // Calculate impulse scalar
                let j = -(1 + restitution) * velocityAlongNormal;
                j /= 1 / ball1.mass + 1 / squirtle.mass;
                
                // Apply impulse
                const impulseX = j * nx;
                const impulseY = j * ny;
                
                // Apply impulses using the new method
                ball1.speedX -= impulseX / ball1.mass;
                ball1.speedY -= impulseY / ball1.mass;
                squirtle.applyImpulse(impulseX, impulseY);
                
                // Move apart to prevent sticking
                const overlap = (b1.radius + squirtleData.radius) - distanceSquirtle;
                const moveX = overlap * nx * 0.5;
                const moveY = overlap * ny * 0.5;
                
                // Adjust position based on mass ratio
                const ball1Ratio = squirtle.mass / (ball1.mass + squirtle.mass);
                const squirtleRatio = ball1.mass / (ball1.mass + squirtle.mass);
                
                ball1.x -= moveX * ball1Ratio;
                ball1.y -= moveY * ball1Ratio;
                squirtle.x += moveX * squirtleRatio;
                squirtle.y += moveY * squirtleRatio;
            }
        }
        
        // Check collision between Pikachu and Squirtle
        const pikachuData = pikachu.getCollisionData();
        const squirtleData = squirtle.getCollisionData();
        
        const dx = squirtleData.x - pikachuData.x;
        const dy = squirtleData.y - pikachuData.y;
        
        // Optimization: Use squared distance
        const distanceSquared = dx * dx + dy * dy;
        const minDistanceSquared = Math.pow(pikachuData.radius + squirtleData.radius, 2);
        
        if (distanceSquared < minDistanceSquared) {
            const distance = Math.sqrt(distanceSquared);
            
            // Calculate collision normal
            const nx = dx / distance;
            const ny = dy / distance;
            
            // Calculate relative velocity
            const vx = squirtle.speedX - pikachu.speedX;
            const vy = squirtle.speedY - pikachu.speedY;
            
            // Calculate relative velocity in terms of the normal direction
            const velocityAlongNormal = vx * nx + vy * ny;
            
            // Do not resolve if velocities are separating
            if (velocityAlongNormal > 0) {
                return;
            }
            
            // Calculate combined restitution (average of both Pokémon)
            const restitution = (pikachu.restitution + squirtle.restitution) / 2;
            
            // Calculate impulse scalar
            let j = -(1 + restitution) * velocityAlongNormal;
            j /= 1 / pikachu.mass + 1 / squirtle.mass;
            
            // Apply impulse
            const impulseX = j * nx;
            const impulseY = j * ny;
            
            // Apply impulses using the new method
            pikachu.applyImpulse(-impulseX, -impulseY);
            squirtle.applyImpulse(impulseX, impulseY);
            
            // Move apart to prevent sticking
            const overlap = (pikachuData.radius + squirtleData.radius) - distance;
            const moveX = overlap * nx * 0.5;
            const moveY = overlap * ny * 0.5;
            
            // Adjust position based on mass ratio 
            const pikachuRatio = squirtle.mass / (pikachu.mass + squirtle.mass);
            const squirtleRatio = pikachu.mass / (pikachu.mass + squirtle.mass);
            
            pikachu.x -= moveX * pikachuRatio;
            pikachu.y -= moveY * pikachuRatio;
            squirtle.x += moveX * squirtleRatio;
            squirtle.y += moveY * squirtleRatio;
        }
    }
    
    // Track last animation timestamp for consistent animation speed
    let lastTimestamp = 0;
    let frameCount = 0;
    const TARGET_FPS = 60;
    const FRAME_TIME = 1000 / TARGET_FPS;
    let animationActive = true;
    
    // Animation loop with timestamp for better timing control
    function animate(timestamp) {
        // Calculate delta time for smoother animation
        if (!lastTimestamp) lastTimestamp = timestamp;
        const deltaTime = timestamp - lastTimestamp;
        
        // Skip frames if tab is inactive (deltaTime too large) or if we're running too fast
        if (deltaTime >= FRAME_TIME && deltaTime < 100) {
            lastTimestamp = timestamp - (deltaTime % FRAME_TIME); // Maintain consistent timing
            
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
            
            frameCount++;
        }
        
        // Page visibility optimization
        if (animationActive) {
            requestAnimFrame(animate);
        }
    }
    
    // Start the animation
    requestAnimFrame(animate);
    
    // Track page visibility to pause animation when tab is not visible
    document.addEventListener('visibilitychange', function() {
        animationActive = !document.hidden;
        if (animationActive && !lastTimestamp) {
            lastTimestamp = 0; // Reset timestamp when becoming visible again
            requestAnimFrame(animate);
        }
    });
    
    // Throttle function to limit the rate at which a function can fire
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Update velocity for all objects based on the current multiplier
    function updateAllVelocities() {
        // Update ball velocities
        for (const ball of balls) {
            ball.updateVelocity(velocityMultiplier);
        }
        
        // Update Pikachu and Squirtle velocities if they support it
        if (typeof pikachu.updateVelocity === 'function') {
            pikachu.updateVelocity(velocityMultiplier);
        }
        
        if (typeof squirtle.updateVelocity === 'function') {
            squirtle.updateVelocity(velocityMultiplier);
        }
    }
    
    // Use a more efficient reset with batch updates
    resetVelocityBtn.addEventListener('click', function() {
        if (velocityMultiplier !== 1.0) {
            velocityMultiplier = 1.0;
            velocitySlider.value = 1.0;
            velocityValue.textContent = '1.0x';
            
            // Apply velocity changes to all objects at once
            updateAllVelocities();
        }
    });
    
    // Cache the slider values to avoid repeated calculations
    const sliderValues = [];
    const steps = (velocitySlider.max - velocitySlider.min) / velocitySlider.step;
    for (let i = 0; i <= steps; i++) {
        const value = parseFloat(velocitySlider.min) + (i * parseFloat(velocitySlider.step));
        sliderValues.push(value);
    }
    
    // Debounce function to limit expensive operations
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    // Handle window resize to update box dimensions (debounced)
    window.addEventListener('resize', debounce(() => {
        const newBoxRect = box.getBoundingClientRect();
        
        // Update box dimensions
        boxRect.width = newBoxRect.width;
        boxRect.height = newBoxRect.height;
        
        // Update Pikachu's box dimensions
        pikachu.boxRect = newBoxRect;
        
        // Update Squirtle's box dimensions
        squirtle.boxRect = newBoxRect;
        
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
        
        // Ensure Squirtle stays within the new boundaries
        squirtle.x = Math.min(squirtle.x, boxRect.width - squirtle.width);
        squirtle.y = Math.min(squirtle.y, boxRect.height - squirtle.height);
        squirtle.updatePosition();
    }, 100));
}); 