// Graffiti Canvas Effect
(function() {
    // Find existing container
    const container = document.getElementById('graffiti-container');
    if (!container) return;

    // Create and inject canvas into the container
    const canvas = document.createElement('canvas');
    canvas.id = 'drawingCanvas';
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d', { alpha: true });

    // Default values
    let currentColor = '#FA0CF7';
    const brushSize = 20; // Fixed brush size
    let activeAnimations = [];

    // Color mapping
    const colorMap = {
        'pink': '#FA0CF7',
        'green': '#00F613',
        'blue': '#96DAE2',
        'yellow': '#FFF100',
        'thistle': '#D2B6DE'
    };

    // Set color from data-pass attribute
    function setColorFromAttribute(element) {
        const colorName = element.getAttribute('data-pass');
        if (colorName && colorMap[colorName]) {
            currentColor = colorMap[colorName];
        }
    }

    // Set canvas size to container size
    function resizeCanvas() {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
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
        const density = size * 4;
        const spread = size * 2;
        
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
        
        const centerDensity = density / 4;
        for (let i = 0; i < centerDensity; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * (spread * 0.5);
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
                if (!isActive) return; // Stop if animation was cancelled

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
                    // Remove from active animations when complete
                    const index = activeAnimations.indexOf(cancelAnimation);
                    if (index > -1) {
                        activeAnimations.splice(index, 1);
                    }
                }
            }
            
            // Create cancel function
            const cancelAnimation = () => {
                isActive = false;
            };

            // Add to active animations
            activeAnimations.push(cancelAnimation);
            
            animateDrip();
        }
    }

    // Drawing functions
    function startDrawing(e) {
        const rect = canvas.getBoundingClientRect();
        isDrawing = true;
        [lastX, lastY] = [
            e.clientX - rect.left,
            e.clientY - rect.top
        ];
    }

    function draw(e) {
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        ctx.globalCompositeOperation = 'source-over';
        sprayPaint(currentX, currentY, brushSize, currentColor.replace(')', ',0.9)'));
        
        const distance = Math.sqrt(Math.pow(currentX - lastX, 2) + Math.pow(currentY - lastY, 2));
        const steps = Math.floor(distance / 2);
        
        for (let i = 0; i < steps; i++) {
            const x = lastX + (currentX - lastX) * (i / steps);
            const y = lastY + (currentY - lastY) * (i / steps);
            sprayPaint(x, y, brushSize * 0.8, currentColor.replace(')', ',0.7)'));
            
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

    // Listen for clicks on elements with data-pass attribute
    document.addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-pass')) {
            setColorFromAttribute(e.target);
        }
    });
})(); 