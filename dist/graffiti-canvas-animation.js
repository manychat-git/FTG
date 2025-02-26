// Graffiti Canvas Effect
(function() {
    // Check if GSAP is available
    if (typeof gsap === 'undefined') {
        console.warn('GSAP is not loaded. Card animation will not work.');
        return;
    }

    // Register ScrollTrigger plugin
    if (typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    } else {
        console.warn('ScrollTrigger plugin is not loaded. Card animation will not work properly.');
    }

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
    let lastDrawing = null;
    
    // Track last dimensions to prevent unnecessary resizes
    let lastWidth = 0;
    let lastHeight = 0;
    let lastDpr = window.devicePixelRatio || 1;

    // LocalStorage key for saving canvas state
    const STORAGE_KEY = 'graffitiCanvasState';
    const ANIMATION_STATE_KEY = 'cardAnimationShown';
    
    // Function to save canvas state to LocalStorage
    function saveCanvasState() {
        try {
            // Save canvas dimensions along with the state
            const state = {
                imageData: canvas.toDataURL(),
                width: canvas.width,
                height: canvas.height,
                dpr: window.devicePixelRatio || 1
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            console.log('Canvas state saved to LocalStorage');
        } catch (error) {
            console.warn('Failed to save canvas state:', error);
        }
    }
    
    // Function to restore canvas state from LocalStorage
    function restoreCanvasState() {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const state = JSON.parse(savedState);
                const currentDpr = window.devicePixelRatio || 1;
                
                // Create a temporary canvas to handle DPR differences
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = state.width;
                tempCanvas.height = state.height;
                
                const img = new Image();
                img.onload = function() {
                    // Draw to temp canvas first
                    tempCtx.drawImage(img, 0, 0);
                    
                    // Calculate scaling factor if DPR changed
                    const scale = currentDpr / state.dpr;
                    
                    // Clear current canvas
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    canvas.width = state.width * scale;
                    canvas.height = state.height * scale;
                    
                    // Scale context appropriately
                    ctx.scale(currentDpr, currentDpr);
                    
                    // Draw scaled image to main canvas
                    ctx.drawImage(
                        tempCanvas, 
                        0, 0, state.width, state.height,
                        0, 0, canvas.width / currentDpr, canvas.height / currentDpr
                    );
                    
                    console.log('Canvas state restored from LocalStorage');
                };
                img.src = state.imageData;
            }
        } catch (error) {
            console.warn('Failed to restore canvas state:', error);
        }
    }

    // Color mapping
    const colorMap = {
        'pink': '#FA0CF7',
        'green': '#00F613',
        'blue': '#96DAE2',
        'yellow': '#FFF100',
        'thistle': '#D2B6DE'
    };

    // Detect mobile or tablet device
    function isMobileOrTablet() {
        let check = false;
        (function(a){
            if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) 
                check = true;
        })(navigator.userAgent||navigator.vendor||window.opera);
        return check || window.matchMedia("(max-width: 1024px)").matches;
    }

    // Check if resize is really needed
    function shouldResize() {
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        const newWidth = Math.round(rect.width * dpr);
        const newHeight = Math.round(rect.height * dpr);
        
        // Check if dimensions or DPR have actually changed
        const hasChanged = newWidth !== lastWidth || 
                          newHeight !== lastHeight || 
                          dpr !== lastDpr;
        
        if (hasChanged) {
            lastWidth = newWidth;
            lastHeight = newHeight;
            lastDpr = dpr;
            return true;
        }
        
        return false;
    }

    // Set canvas size to container size
    function resizeCanvas() {
        // Skip if no real resize is needed
        if (!shouldResize()) {
            return;
        }

        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();

        if (isMobileOrTablet()) {
            // Save current drawing before resize
            lastDrawing = ctx.getImageData(0, 0, canvas.width, canvas.height);
        }

        // Reset transformations to prevent accumulation
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Set the "actual" size of the canvas
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
        
        // Scale the context to ensure correct drawing operations
        ctx.scale(dpr, dpr);
        
        // Set the "drawn" size of the canvas
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        if (isMobileOrTablet() && lastDrawing) {
            // Restore the drawing after resize
            ctx.putImageData(lastDrawing, 0, 0);
            console.log("Restored drawing after resize");
        }
        
        console.log("Canvas resized to:", canvas.width, "x", canvas.height, "with DPR:", dpr);
    }

    // Clear canvas with proper dimensions
    function clearCanvas() {
        console.log("Clearing canvas...");
        
        // Get the container dimensions
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        // Reset the canvas size to trigger a clear
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
        
        // Reset the scale for Retina displays
        ctx.scale(dpr, dpr);
        
        // Clear active drip animations
        activeAnimations.forEach(cancel => cancel());
        activeAnimations = [];
        
        // Clear the saved state in LocalStorage
        localStorage.removeItem(STORAGE_KEY);
        
        console.log("Canvas cleared with dimensions:", canvas.width, "x", canvas.height);
    }

    // Function to handle card animation
    function initCardAnimation() {
        const card = document.querySelector('[data-pass="container"]');
        if (!card) {
            console.warn('Card element with data-pass="container" not found');
            return;
        }

        console.log('Initializing card animation');

        // Check if animation was already shown
        const animationShown = localStorage.getItem(ANIMATION_STATE_KEY);
        
        if (!animationShown) {
            console.log('First time animation');
            
            // Initial setup for the card
            gsap.set(card, {
                scale: 0,
                opacity: 0,
                rotation: -180,
                transformOrigin: "center center"
            });

            // Wait a bit to ensure proper initialization
            setTimeout(() => {
                // Create and run the animation
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: card,
                        start: "top 80%",
                        end: "top 50%",
                        toggleActions: "play none none none",
                        once: true,
                        onComplete: () => {
                            console.log('Animation completed');
                            localStorage.setItem(ANIMATION_STATE_KEY, 'true');
                        }
                    }
                });

                tl.to(card, {
                    scale: 1,
                    opacity: 1,
                    rotation: 0,
                    duration: 0.7,
                    ease: "back.out(1.4)"
                })
                .to(card, {
                    scale: 1,
                    duration: 0.4,
                    ease: "bounce.out"
                });

                console.log('Animation timeline created');
            }, 100);
        } else {
            console.log('Animation already shown, setting final state');
            // If animation was already shown, just set final state
            gsap.set(card, {
                scale: 1,
                opacity: 1,
                rotation: 0,
                transformOrigin: "center center"
            });
        }
    }

    // Initial setup
    resizeCanvas();
    restoreCanvasState(); // Restore previous state if exists
    
    // Initialize card animation after DOM content is loaded
    document.addEventListener("DOMContentLoaded", initCardAnimation);
    
    // Use ResizeObserver instead of scroll events
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (entry.target === container) {
                resizeCanvas();
            }
        }
    });

    resizeObserver.observe(container);
    
    // Add load event listener first
    window.addEventListener('load', () => {
        console.log("Window loaded, resizing canvas...");
        resizeCanvas();
    });
    
    // Then add resize event listener with debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (!isMobileOrTablet()) {
            console.log("Window resized, updating canvas...");
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeCanvas, 150);
        }
    });

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
        
        // Save state after each drawing operation
        // Use debounce to prevent too frequent saves
        clearTimeout(draw.saveTimeout);
        draw.saveTimeout = setTimeout(saveCanvasState, 1000);
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
        const element = e.target;
        if (element.hasAttribute('data-pass')) {
            const action = element.getAttribute('data-pass');
            console.log('Clicked element with data-pass:', action);
            
            if (action === 'clean') {
                // Prevent any default actions (links, forms, etc)
                e.preventDefault();
                e.stopPropagation();
                
                // If the element is inside a link or button, prevent their action too
                let parent = element.parentElement;
                while (parent) {
                    if (parent.tagName === 'A' || parent.tagName === 'BUTTON' || parent.tagName === 'FORM') {
                        e.preventDefault();
                        break;
                    }
                    parent = parent.parentElement;
                }
            }
            
            setColorFromAttribute(element);
        }
    }, true); // Use capture phase to handle event before other listeners

    // Also listen for touch events on elements with data-pass
    document.addEventListener('touchend', (e) => {
        const element = e.target;
        if (element.hasAttribute('data-pass')) {
            const action = element.getAttribute('data-pass');
            console.log('Touched element with data-pass:', action);
            
            if (action === 'clean') {
                // Prevent any default actions (links, forms, etc)
                e.preventDefault();
                e.stopPropagation();
                
                // If the element is inside a link or button, prevent their action too
                let parent = element.parentElement;
                while (parent) {
                    if (parent.tagName === 'A' || parent.tagName === 'BUTTON' || parent.tagName === 'FORM') {
                        e.preventDefault();
                        break;
                    }
                    parent = parent.parentElement;
                }
            }
            
            setColorFromAttribute(element);
        }
    }, true); // Use capture phase to handle event before other listeners

    // Set color from data-pass attribute
    function setColorFromAttribute(element) {
        const colorName = element.getAttribute('data-pass');
        console.log('Setting color from attribute:', colorName);
        
        // Handle clean command first
        if (colorName === 'clean') {
            console.log('Clean command detected, clearing canvas...');
            clearCanvas();
            return;
        }
        
        // Only check color map if it's not a clean command
        if (colorMap[colorName]) {
            console.log('Setting brush color to:', colorMap[colorName]);
            currentColor = colorMap[colorName];
        }
    }
})(); 