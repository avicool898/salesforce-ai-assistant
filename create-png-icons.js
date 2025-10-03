// Simple script to create PNG icons from canvas
// Run this in a browser console or Node.js environment

const fs = require('fs');
const { createCanvas } = require('canvas');

function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#0176d3');
    gradient.addColorStop(1, '#014486');
    
    // Draw background circle
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw white border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw AI brain network
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#fff';
    
    // Central brain
    ctx.beginPath();
    ctx.arc(size/2, size/2 - size/8, size/6, 0, 2 * Math.PI);
    ctx.lineWidth = size/20;
    ctx.stroke();
    
    // Neural nodes
    const nodeSize = size/16;
    const positions = [
        [size/4, size/4],
        [3*size/4, size/4],
        [size/6, size/2],
        [5*size/6, size/2],
        [size/4, 3*size/4],
        [3*size/4, 3*size/4]
    ];
    
    positions.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, nodeSize, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Connection lines
    ctx.lineWidth = size/40;
    ctx.globalAlpha = 0.8;
    positions.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(size/2, size/2 - size/8);
        ctx.stroke();
    });
    
    // Add SF text
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${size/6}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('SF', size/2, size - size/8);
    
    return canvas.toBuffer('image/png');
}

// Create icons
[16, 48, 128].forEach(size => {
    const buffer = createIcon(size);
    fs.writeFileSync(`src/icons/icon${size}.png`, buffer);
    console.log(`Created icon${size}.png`);
});