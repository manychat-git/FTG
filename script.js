const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d', { alpha: true });
const brushSize = document.getElementById('brushSize');
const clearButton = document.getElementById('clearCanvas');
const colorButtons = document.querySelectorAll('.color-btn');

let currentColor = '#FA0CF7'; // Default color

// Color selection
colorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        colorButtons.forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        // Update current color
        currentColor = btn.dataset.color;
    });
});

// Set canvas size to window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Initial setup
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Spray paint effect
function getRandomOffset(spread) {
    return Math.random() * spread - spread / 2;
}

// Improved spray paint effect
function sprayPaint(x, y, size, color) {
    const density = size * 4; // Increased base density
    const spread = size * 2;  // Tighter spread for more control
    
    // Create main dense center
    ctx.fillStyle = color;
    for (let i = 0; i < density; i++) {
        // Calculate distance from center
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * spread;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        
        // Particles get smaller towards the edges
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        const maxDistance = spread;
        const normalizedDistance = distance / maxDistance;
        
        // Adjust opacity and size based on distance from center
        const opacity = 1 - normalizedDistance;
        const particleSize = Math.random() * 1.5 * (1 - normalizedDistance * 0.5);
        
        // Set color with adjusted opacity
        ctx.fillStyle = color.replace(')', `,${opacity})`);
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(
            x + offsetX,
            y + offsetY,
            particleSize,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
    
    // Add some random larger particles in the center
    const centerDensity = density / 4;
    for (let i = 0; i < centerDensity; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * (spread * 0.5); // Only in center area
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        
        ctx.fillStyle = color.replace(')', `,${0.8})`);
        ctx.beginPath();
        ctx.arc(
            x + offsetX,
            y + offsetY,
            Math.random() * 2 + 1,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

// Enhanced drip effect with paint flow
function createDrip(x, y, color) {
    if (Math.random() < 0.5) { // 50% chance for drips
        const dripLength = Math.random() * 100 + 50; // Drips 50-150px long
        const speed = Math.random() * 2 + 0.5; // Keep same speed
        const width = Math.random() * 2 + 1; // Keep same width
        const waviness = Math.random() * 1.5; // Keep same waviness
        const baseX = x;
        let currentLength = 0;
        let phase = Math.random() * Math.PI * 2;

        function animateDrip() {
            if (currentLength < dripLength) {
                const alpha = 1 - (currentLength / dripLength) * 0.7;
                const currentX = baseX + Math.sin(currentLength * 0.02 + phase) * waviness;
                
                // Create a gradient for more realistic drip
                const gradient = ctx.createLinearGradient(
                    currentX, y + currentLength,
                    currentX, y + currentLength + 40
                );
                const colorStart = color.replace(')', `,${alpha})`);
                const colorEnd = color.replace(')', `,${alpha * 0.1})`);
                gradient.addColorStop(0, colorStart);
                gradient.addColorStop(1, colorEnd);
                
                ctx.fillStyle = gradient;
                
                // Draw main drip body
                ctx.beginPath();
                ctx.ellipse(
                    currentX, 
                    y + currentLength, 
                    width * (1 - currentLength/dripLength * 0.4),
                    2,
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Add occasional tiny drips
                if (Math.random() < 0.08) {
                    ctx.fillStyle = colorStart;
                    ctx.beginPath();
                    ctx.arc(
                        currentX + Math.random() * 3 - 1.5,
                        y + currentLength,
                        Math.random() * 1 + 0.5,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
                
                currentLength += speed;
                requestAnimationFrame(animateDrip);
            }
        }
        
        animateDrip();
    }
}

// Drawing functions
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.clientX, e.clientY];
}

function draw(e) {
    if (!isDrawing) return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    const size = parseInt(brushSize.value);
    
    ctx.globalCompositeOperation = 'source-over';
    // Main spray at current position
    sprayPaint(currentX, currentY, size, currentColor.replace(')', ',0.9)'));
    
    // Connect points with a line for continuous effect
    const distance = Math.sqrt(Math.pow(currentX - lastX, 2) + Math.pow(currentY - lastY, 2));
    const steps = Math.floor(distance / 2);
    
    for (let i = 0; i < steps; i++) {
        const x = lastX + (currentX - lastX) * (i / steps);
        const y = lastY + (currentY - lastY) * (i / steps);
        sprayPaint(x, y, size * 0.8, currentColor.replace(')', ',0.7)'));
        
        if (Math.random() < 0.05) {
            createDrip(x, y, currentColor);
        }
    }
    
    if (Math.random() < 0.5) {
        createDrip(currentX, currentY, currentColor);
    }
    
    [lastX, lastY] = [currentX, currentY];
}

function stopDrawing() {
    isDrawing = false;
}

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch events support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    startDrawing(touch);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    draw(touch);
});

canvas.addEventListener('touchend', stopDrawing);

// Clear canvas
clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}); 