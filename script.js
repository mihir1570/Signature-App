document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("signature-pad");
    const ctx = canvas.getContext("2d");
    const clearButton = document.getElementById("clear");
    const downloadPngButton = document.getElementById("download-png");
    const downloadJpgButton = document.getElementById("download-jpg");
    const thicknessInput = document.getElementById("thickness");
    const colorInput = document.getElementById("color");
    const signatureText = document.querySelector('.absolute');


    // Set canvas resolution
    const dpi = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpi;
    canvas.height = canvas.clientHeight * dpi;
    ctx.scale(dpi, dpi);

    let isDrawing = false;
    let hasDrawn = false;
    let points = [];

    function resizeCanvas() {
        const dpi = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpi;
        canvas.height = canvas.clientHeight * dpi;
        ctx.scale(dpi, dpi);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = thicknessInput.value;
        ctx.strokeStyle = colorInput.value;

        redraw(); // Redraw the signature when the canvas is resized
    }

    function startDrawing(event) {
        isDrawing = true;
        points.push([]);
        const [x, y] = getMousePos(event);
        points[points.length - 1].push({ x, y });
        ctx.beginPath();
        ctx.moveTo(x, y);

        // Hide signature text when drawing starts
        signatureText.style.display = 'none';
    }

    function draw(event) {
        if (!isDrawing) return;
        const [x, y] = getMousePos(event);
        points[points.length - 1].push({ x, y });
        ctx.lineTo(x, y);
        ctx.stroke();
        hasDrawn = true;
    }

    function stopDrawing() {
        if (!isDrawing) return;
        isDrawing = false;
        ctx.closePath();
        smoothSignature(points[points.length - 1]);
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
        points = [];
        hasDrawn = false;
    }

    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = thicknessInput.value;
        ctx.strokeStyle = colorInput.value;

        points.forEach(stroke => {
            if (stroke.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(stroke[0].x, stroke[0].y);
            for (let i = 1; i < stroke.length - 2; i++) {
                const xc = (stroke[i].x + stroke[i + 1].x) / 2;
                const yc = (stroke[i].y + stroke[i + 1].y) / 2;
                ctx.quadraticCurveTo(stroke[i].x, stroke[i].y, xc, yc);
            }
            ctx.quadraticCurveTo(
                stroke[stroke.length - 2].x,
                stroke[stroke.length - 2].y,
                stroke[stroke.length - 1].x,
                stroke[stroke.length - 1].y
            );
            ctx.stroke();
            ctx.closePath();
        });
    }

    function downloadCanvas(format) {
        if (!hasDrawn) {
            alert("Please sign before downloading.");
            return;
        }
        const link = document.createElement('a');
        if (format === 'jpeg') {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.fillStyle = '#fff'; // Set white background
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(canvas, 0, 0);
            link.href = tempCanvas.toDataURL(`image/${format}`);
        } else {
            link.href = canvas.toDataURL(`image/${format}`);
        }
        link.download = `signature.${format}`;
        link.click();
    }

    function updateThickness() {
        ctx.lineWidth = this.value;
        redraw();
    }

    function updateColor() {
        ctx.strokeStyle = this.value;
        redraw();
    }

    function smoothSignature(points) {
        if (points.length < 3) return;
        const stroke = [];
        stroke.push(points[0]);
        for (let i = 1; i < points.length - 2; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            stroke.push({ x: xc, y: yc });
        }
        stroke.push(points[points.length - 1]);
        points.length = 0;
        points.push(...stroke);
        redraw();
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

























