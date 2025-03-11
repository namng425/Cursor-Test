# Bouncing Balls Animation with Pokémon

A fun, interactive web animation featuring bouncing balls and Pokémon characters (Pikachu and Squirtle) that move around and collide in a confined space, all rendered with optimized physics and performance.

## Description

This project creates a visually engaging animation where colorful balls and Pokémon characters bounce around within a container. The animation demonstrates advanced physics principles including impulse-based collision detection and response between multiple objects of varying mass and elasticity.

### Features

- Six colorful bouncing balls with random initial positions and velocities
- Pikachu and Squirtle characters with unique physics properties
- Advanced physics-based collisions with impulse resolution and mass-based responses
- Spatial partitioning for optimized collision detection
- Smooth animations optimized for performance
- Interactive velocity controls with touch support
- Mobile-responsive design
- Reduced CPU usage through various optimizations

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript (ES6)
- Advanced physics-based animation techniques
- GPU-accelerated rendering
- Throttled event handling
- Sprite-based character rendering
- Spatial partitioning

## How It Works

The animation uses JavaScript to:
1. Create multiple ball objects with random properties and physics characteristics
2. Add Pikachu and Squirtle characters with distinct mass and restitution properties
3. Implement spatial partitioning for efficient collision detection
4. Calculate impulse-based physics movements and collisions in real-time
5. Update the DOM with minimal reflows using transform properties
6. Use requestAnimationFrame with FPS control for smooth animation
7. Pause animations when tab is not visible for battery/CPU conservation

## Physics System Details

The animation implements a comprehensive 2D physics system with:

- **Conservation of Momentum**: Objects react based on their relative masses
- **Restitution Control**: Different objects have different bounciness properties
- **Impulse-Based Collisions**: Proper physics-based collision response
- **Spatial Partitioning**: O(n) collision detection instead of O(n²)
- **Position Correction**: Prevents objects from overlapping
- **Wall Collision Physics**: Proper reflection with energy loss
- **Light Friction/Damping**: Gradual velocity reduction over time

## Controls

The interface includes interactive controls that allow you to:
- Adjust the speed of all objects using the slider (from 0.5x to 2.0x the normal speed)
- Reset the speed to the default value (1.0x) with a single click
- See the current speed multiplier displayed next to the slider
- Full touch-screen support for mobile devices

## Performance Optimizations

- **GPU Acceleration**: Using CSS transforms and will-change property
- **Reduced DOM Updates**: Only updating the DOM when positions change significantly
- **Event Throttling**: Limiting the rate of slider input processing
- **Batch Updates**: Updating all velocities at once rather than per-frame
- **Memory Optimization**: Reusing objects and strings where possible
- **Page Visibility API**: Pausing animations when tab is not visible
- **Consistent Frame Timing**: Using deltaTime for frame-rate independence
- **Lazy Loading**: Deferring script loading for faster page load

## Visual Design

- Nostalgic Xanga-themed interface with retro Pokémon design
- Mobile-responsive layout that adapts to different screen sizes
- Optimized slider controls with visual feedback
- Proper preloading of critical resources for smoother startup

## Getting Started

Simply open the `index.html` file in any modern web browser to see the animation in action. No additional setup or dependencies are required.

## Customization

You can modify various aspects of the animation by editing:
- `script.js` - Change the number of balls, their size, physics properties, or velocity range
- `pikachu.js` and `squirtle.js` - Modify the Pokémon characters' behavior
- `styles.css` - Adjust the visual appearance of all elements and controls
- `index.html` - Modify the layout or add additional interactive elements

## Browser Compatibility

This animation has been optimized to work across modern browsers including:
- Chrome
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome for Android)

## License

This project is open source and available under the MIT License. 