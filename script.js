const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d', { alpha: true });
const brushSize = document.getElementById('brushSize');
const clearButton = document.getElementById('clearCanvas');
const colorButtons = document.querySelectorAll('.color-btn');

let currentColor = '#FA0CF7'; // Default color
let activeAnimations = [];

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
    const dpr = window.devicePixelRatio || 1;
    
    // Reset transformations to prevent accumulation
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Set the "actual" size of the canvas
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    
    // Scale the context to ensure correct drawing operations
    ctx.scale(dpr, dpr);
    
    // Set the "drawn" size of the canvas
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    
    console.log("Canvas resized to:", canvas.width, "x", canvas.height, "with DPR:", dpr);
}

// Initial setup
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Spray paint effect
function sprayPaint(x, y, size, color) {
    const density = size * 4; // Increased base density
    const spread = size * 2;  // Tighter spread for more control
    
    // Create main dense center
    ctx.fillStyle = color;
    for (let i = 0; i < density; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * spread;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        const maxDistance = spread;
        const normalizedDistance = distance / maxDistance;
        
        const opacity = 1 - normalizedDistance;
        const particleSize = Math.random() * 1.5 * (1 - normalizedDistance * 0.5);
        
        ctx.fillStyle = color.replace(')', `,${opacity})`);
        
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

// Enhanced drip effect
function createDrip(x, y, color) {
    if (Math.random() < 0.5) {
        const dripLength = Math.random() * 70 + 30; // Drips 30-100px long
        const speed = Math.random() * 2 + 0.5;
        const width = Math.random() * 2 + 1;
        const waviness = Math.random() * 1.5;
        const baseX = x;
        let currentLength = 0;
        let phase = Math.random() * Math.PI * 2;
        let isActive = true;

        function animateDrip() {
            if (!isActive) return;

            if (currentLength < dripLength) {
                const alpha = 1 - (currentLength / dripLength) * 0.7;
                const currentX = baseX + Math.sin(currentLength * 0.02 + phase) * waviness;
                
                const gradient = ctx.createLinearGradient(
                    currentX, y + currentLength,
                    currentX, y + currentLength + 40
                );
                const colorStart = color.replace(')', `,${alpha})`);
                const colorEnd = color.replace(')', `,${alpha * 0.1})`);
                gradient.addColorStop(0, colorStart);
                gradient.addColorStop(1, colorEnd);
                
                ctx.fillStyle = gradient;
                
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
            } else {
                const index = activeAnimations.indexOf(cancelAnimation);
                if (index > -1) {
                    activeAnimations.splice(index, 1);
                }
            }
        }
        
        const cancelAnimation = () => {
            isActive = false;
        };

        activeAnimations.push(cancelAnimation);
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
    sprayPaint(currentX, currentY, size, currentColor.replace(')', ',0.9)'));
    
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
    
    if (Math.random() < 0.3) { // 30% chance for drip at stroke end
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
function clearCanvas() {
    const dpr = window.devicePixelRatio || 1;
    
    // Reset the canvas size to trigger a clear
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    
    // Reset the scale for Retina displays
    ctx.scale(dpr, dpr);
    
    // Clear active drip animations
    activeAnimations.forEach(cancel => cancel());
    activeAnimations = [];
}

clearButton.addEventListener('click', clearCanvas);

// Add Save as PNG button to controls
const controlsDiv = document.querySelector('.controls');
const saveGroup = document.createElement('div');
saveGroup.className = 'control-group';
const saveButton = document.createElement('button');
saveButton.id = 'saveCanvas';
saveButton.className = 'action-btn';
saveButton.textContent = 'Save as PNG';
saveGroup.appendChild(saveButton);
controlsDiv.appendChild(saveGroup);

// Save canvas as PNG
saveButton.addEventListener('click', () => {
    // Create a temporary canvas to save without background
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    
    // Copy the current canvas content
    tempCtx.drawImage(canvas, 0, 0);
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'graffiti.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
}); 