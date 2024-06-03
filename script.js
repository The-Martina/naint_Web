document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("canvas");
    const context = canvas.getContext("2d");
    let color = "#2D2D2A";
    let brushSize = 2;
    let recentColors = ["#e6e6e6", "#2D2D2A", "#E63946", "#007EA7", "#F4E409"];
    let isTransparent = false;

    // Create recent color buttons
    const recentColorsContainer = document.getElementById("recent-colors");
    recentColors.forEach(recentColor => {
        const button = document.createElement("button");
        button.classList.add("recentColor");
        button.style.backgroundColor = recentColor;
        button.addEventListener("click", function() {
            setColor(recentColor);
        });
        recentColorsContainer.appendChild(button);
    });

    const colorPreview = document.getElementById("color-preview");
    const colorPicker = document.getElementById("color-picker");
    const brushSlider = document.getElementById("brush-slider");
    const clearButton = document.getElementById("clear-button");
    const undoButton = document.getElementById("undo-button");
    const saveButton = document.getElementById("save-button");
    const loadButton = document.getElementById("load-button");
    const changeResolutionButton = document.getElementById("change-resolution-button");
    const changeBackgroundColorButton = document.getElementById("change-background-color-button");
    const transparentBackgroundButton = document.getElementById("transparent-background-button");

    canvas.addEventListener("mousedown", startPaint);
    canvas.addEventListener("mouseup", stopPaint);
    canvas.addEventListener("mousemove", draw);

    colorPicker.addEventListener("input", chooseColor);
    brushSlider.addEventListener("input", setBrushSize);
    clearButton.addEventListener("click", clearCanvas);
    undoButton.addEventListener("click", undo);
    saveButton.addEventListener("click", saveCanvas);
    loadButton.addEventListener("click", loadCanvas);
    changeResolutionButton.addEventListener("click", changeResolution);
    changeBackgroundColorButton.addEventListener("click", changeBackgroundColor);
    transparentBackgroundButton.addEventListener("click", toggleTransparentBackground);

    let painting = false;

    let coordsStack = [];
    let undoStack = [];

    function startPaint(event) {
        painting = true;
        draw(event);
    }

    function stopPaint() {
        painting = false;
        context.beginPath();
        coordsStack.push(null);
    }

    function draw(event) {
        if (!painting) return;

        context.lineWidth = brushSize;
        context.lineCap = "round";
        context.strokeStyle = color;

        context.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
        context.stroke();
        context.beginPath();
        context.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);

        coordsStack.push([event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop]);
    }

    function chooseColor() {
        color = colorPicker.value;
        colorPreview.style.backgroundColor = color;
    }

    function setBrushSize() {
        brushSize = this.value;
    }

    function clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        coordsStack = [];
        undoStack = [];
    }

    function undo() {
        if (coordsStack.length === 0) return;

        // Eliminar el último trazo del stack de coordenadas
        coordsStack.pop();

        // Limpiar el lienzo
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Redibujar todos los trazos excepto el último eliminado
        redraw();
    }

    function redraw() {
        // Iterar sobre el stack de coordenadas y dibujar cada trazo
        coordsStack.forEach((coords, index) => {
            if (coords === null) {
                context.beginPath();
            } else {
                context.lineTo(coords[0], coords[1]);
                context.stroke();
            }

            // Guardar cada trazo en el undoStack para poder deshacerlo completamente
            if (index < coordsStack.length - 1 || coords === null) {
                undoStack.push(coords);
            }
        });
    }

    function saveCanvas() {

        const tempCanvas = document.createElement("canvas");
        const tempContext = tempCanvas.getContext("2d");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;


        tempContext.fillStyle = canvas.style.backgroundColor;
        tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

        tempContext.drawImage(canvas, 0, 0);


        const dataURL = tempCanvas.toDataURL();


        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "canvas_image.png";
        link.click();
    }


    function loadCanvas() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.addEventListener("change", handleFile);
        input.click();
    }

    function handleFile(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                context.drawImage(img, 0, 0);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function setColor(newColor) {
        color = newColor;
        colorPicker.value = color;
        colorPreview.style.backgroundColor = color;
    }

    function changeResolution() {
        const newWidth = prompt("Enter new width:");
        const newHeight = prompt("Enter new height:");
        canvas.width = parseInt(newWidth);
        canvas.height = parseInt(newHeight);
        clearCanvas();
    }

    function changeBackgroundColor() {
        //const newColor = prompt("Enter new background color:");
        canvas.style.backgroundColor = colorPicker.value;
    }

    function toggleTransparentBackground() {
        isTransparent = !isTransparent;
        if (isTransparent) {
            canvas.style.backgroundColor = "transparent";
        } else {
            canvas.style.backgroundColor = "#e6e6e6"; // Change to your default background color if needed
        }
    }

});
