/// LOAD IMAGE NODE ///
function LoadImageNode() {
    this.frame = new Image();
    this.size = [200, 200];

    this.properties = {
        output: { url: "", width: 0, height: 0 }
    };
    this.addOutput("Out", "image");
    this.addWidget("button", "Load", generateUniqueID(), this.onButtonClicked.bind(this));
}
LoadImageNode.title = "Load Image";
LoadImageNode.desc = "Image loader";
LoadImageNode.supported_extensions = ["png", "jpg", "jpeg"];
LoadImageNode.prototype.onDrawBackground = function(ctx) {
    this.frame.src  = this.properties.output.url;
    if (this.frame && !this.flags.collapsed) {
        ctx.drawImage(this.frame, 0, 0, this.size[0], this.size[1]);
    }
};
LoadImageNode.prototype.onExecute = function() {
    this.setOutputData(0, this.properties.output);
}
LoadImageNode.prototype.onButtonClicked = function () {
    var that = this;
    // Create input
    var inputImg = document.createElement("input");
    inputImg.type = "file";
    inputImg.accept = "image/*";
    inputImg.onchange = function(event) {
      handleImageInput(event, that);
    };
    inputImg.click(); // Trigger file selection dialog
};
LiteGraph.registerNodeType("Input/LoadImage", LoadImageNode);

function handleImageInput(event, node) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    if (file) {
        const fileUrl = window.URL.createObjectURL(file);
        const fileType = file.type.split('/')[0];
        if (fileType === 'image') {
            node.properties.output.url = fileUrl;
            // Create an Image object
            const img = new Image();
            // Set up event listener for when the image has loaded
            img.onload = function() {
                // Access the image's natural width and height
                removeWidgetsByType(node, "static");  // Remove prev elements
                node.properties.output.width = img.naturalWidth;
                node.properties.output.height = img.naturalHeight;
                node.addWidget("static", "Width", node.properties.output.width, function(v) { this.value = node.properties.output.width });
                node.addWidget("static", "Height", node.properties.output.height, function(v) { this.value = node.properties.output.height });
                // Here you can perform further actions with the image dimensions
                var ratioView = node.properties.output.width / node.properties.output.height
                if (ratioView > 1) {
                    node.size = [200 * ratioView, 200]
                } else {
                    node.size = [200, 200 / ratioView]
                };
                node.setDirtyCanvas(true);
            };
            // Set the image source to start loading it
            img.src = fileUrl;
        }
    }
};
/// LOAD IMAGE NODE ///