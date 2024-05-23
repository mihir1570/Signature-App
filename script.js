document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("signature-pad");
    const ctx = canvas.getContext("2d");
    const clearButton = document.getElementById("clear");
    const downloadPngButton = document.getElementById("download-png");
    const downloadJpgButton = document.getElementById("download-jpg");
    const thicknessInput = document.getElementById("thickness");
    const colorInput = document.getElementById("color");

    // Set canvas resolution
    const dpi = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpi;
    canvas.height = canvas.clientHeight * dpi;
    ctx.scale(dpi, dpi);

    let isDrawing = false;
    let hasDrawn = false;
    let lastX = 0;
    let lastY = 0;

    function resizeCanvas() {
        // Set canvas resolution
        const dpi = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpi;
        canvas.height = canvas.clientHeight * dpi;
        ctx.scale(dpi, dpi);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = thicknessInput.value;
        ctx.strokeStyle = colorInput.value;
        if (!hasDrawn) {
            clearCanvas(); // Clear the canvas to apply new settings
        }
    }

    function startDrawing(event) {
        isDrawing = true;
        [lastX, lastY] = getMousePos(event);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
    }

    function draw(event) {
        if (!isDrawing) return;
        const [x, y] = getMousePos(event);
        ctx.lineTo(x, y);
        ctx.stroke();
        [lastX, lastY] = [x, y];
        hasDrawn = true;
    }

    function stopDrawing() {
        isDrawing = false;
        ctx.closePath();
    }

    function getMousePos(event) {
        const rect = canvas.getBoundingClientRect();
        return [
            (event.clientX || event.touches[0].clientX) - rect.left,
            (event.clientY || event.touches[0].clientY) - rect.top
        ];
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hasDrawn = false;
    }

    function downloadCanvas(format) {
        if (!hasDrawn) {
            alert("Please sign before downloading.");
            return;
        }
        if (format === 'jpeg') {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.fillStyle = '#fff'; // Set white background
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(canvas, 0, 0);
            const link = document.createElement('a');
            link.href = tempCanvas.toDataURL(`image/${format}`);
            link.download = `signature.${format}`;
            link.click();
        } else {
            const link = document.createElement('a');
            link.href = canvas.toDataURL(`image/${format}`);
            link.download = `signature.${format}`;
            link.click();
        }
    }

    function updateThickness() {
        ctx.lineWidth = this.value;
    }

    function updateColor() {
        ctx.strokeStyle = this.value;
    }

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseout", stopDrawing);

    canvas.addEventListener("touchstart", event => {
        const touch = event.touches[0];
        const mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener("touchmove", event => {
        const touch = event.touches[0];
        const mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener("touchend", () => {
        const mouseEvent = new MouseEvent("mouseup");
        canvas.dispatchEvent(mouseEvent);
    });

    clearButton.addEventListener("click", clearCanvas);
    downloadPngButton.addEventListener("click", () => downloadCanvas('png'));
    downloadJpgButton.addEventListener("click", () => downloadCanvas('jpeg'));

    thicknessInput.addEventListener("input", updateThickness);
    colorInput.addEventListener("input", updateColor);

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas(); // Adjust the canvas size when the page loads

    // Initial settings
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = thicknessInput.value;
    ctx.strokeStyle = colorInput.value;
});
