# Bouncing Balls Animation with Pokémon

A fun, interactive web animation featuring bouncing balls and Pokémon characters (Pikachu and Squirtle) that move around and collide in a confined space.

## Description

This project creates a visually engaging animation where colorful balls and Pokémon characters bounce around within a container. The animation demonstrates basic physics principles including collision detection and response between multiple objects.

### Features

- Six colorful bouncing balls with random initial positions and velocities
- Pikachu and Squirtle characters that move around the container
- Realistic physics-based collisions between all objects
- Smooth animations optimized for performance
- Interactive velocity controls to adjust the speed of the balls

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript (ES6)
- Physics-based animation techniques
- Sprite-based character rendering

## How It Works

The animation uses JavaScript to:
1. Create multiple ball objects with random properties
2. Add Pikachu and Squirtle characters to the scene
3. Calculate physics-based movements and collisions in real-time
4. Update the DOM to reflect the new positions of all elements
5. Use requestAnimationFrame for smooth animation

## Controls

The interface includes interactive controls that allow you to:
- Adjust the speed of all balls using the slider (from 0.5x to 2.0x the normal speed)
- Reset the speed to the default value (1.0x) with a single click
- See the current speed multiplier displayed next to the slider

## Visual Design

- Dark-themed interface for better contrast with the colorful elements
- Pixelated Pokémon sprites with subtle glow effects
- Smooth animations with optimized rendering
- Pokémon-themed control panel with yellow and blue accents

## Getting Started

Simply open the `index.html` file in any modern web browser to see the animation in action. No additional setup or dependencies are required.

## Customization

You can modify various aspects of the animation by editing:
- `script.js` - Change the number of balls, their size, physics properties, or velocity range
- `pikachu.js` and `squirtle.js` - Modify the Pokémon characters' behavior
- `styles.css` - Adjust the visual appearance of all elements and controls
- `index.html` - Modify the layout or add additional interactive elements 