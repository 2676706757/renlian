/// LOAD VIDEO NODE ///
function LoadVideoNode() {
    this.frame = new Image();
    this.size = [200, 200];
    this.step = 0
    this.prevTime = 0

    this.properties = {
        output: { url: "", preview: [""], start: "00:00:00.000", end: "00:00:00.000", width: 0, height: 0, stylePlay: "", styleTimeline: "" }
    };
    this.addOutput("Out", "video");
    this.addWidget("button", "Load", generateUniqueID(), this.onButtonClicked.bind(this));
}
LoadVideoNode.title = "Load Video";
LoadVideoNode.desc = "Video loader";
LoadVideoNode.supported_extensions = ["mp4"];
LoadVideoNode.prototype.onDrawBackground = function(ctx) {
    this.frames = this.properties.output.preview
    if (this.frames) {
        if (!Array.isArray(this.frames)) {
            this.frames = [this.frames]; // Convert to an array if it's a single string
        }
        const now = Date.now();
        if (now - this.prevTime > 1000) {
            this.step = (this.step + 1) % this.frames.length; // Increment step and loop back to 0 if it exceeds the length
            this.prevTime = now;
        };
        this.frame.src = this.frames[this.step];
        if (this.frame && !this.flags.collapsed) {
            ctx.drawImage(this.frame, 0, 0, this.size[0], this.size[1]);
        }
    };
};
LoadVideoNode.prototype.onExecute = function() {
    // Set the preview image to output "Frame"
    this.setOutputData(0, this.properties.output);
}
LoadVideoNode.prototype.onButtonClicked = function () {
    introLoadVideoNode(this);
};
LiteGraph.registerNodeType("Input/LoadVideo", LoadVideoNode);


async function introLoadVideoNode(elem) {
  var introNode = introJs();
  // Create an empty div for intro content
  var introContent = document.createElement("div");
  // Container element
  const idContainer = generateUniqueID();
  var containerElement = document.createElement("div");
  containerElement.style.width = "auto";
  containerElement.style.height = "auto";
  containerElement.id = idContainer;
  // Append the container to the intro content
  introContent.appendChild(containerElement);
  if (elem.properties.output.url === ""){
    // Create input
    var inputVideo = document.createElement("input");
    inputVideo.type = "file";
    inputVideo.accept = "video/*";
    inputVideo.onchange = function(event) {
      handleVideoInput(event, elem.properties, idContainer, introNode);
    };
    inputVideo.click(); // Trigger file selection dialog
  };

  introNode.setOptions({
    steps: [
      {
        title: "Edit Video",
        intro: introContent.innerHTML,
      },
    ],
    showButtons: false,
    showStepNumbers: false,
    showBullets: false,
    nextLabel: "Next",
    prevLabel: "Back",
    doneLabel: "Close",
  });
  introNode.start();

  if (elem.properties.output.url !== ""){
    loadVideoFromUrl(elem.properties.output.url, elem.properties, idContainer, introNode);
  }

  // Save button
  saveBtn = document.createElement("a");
  saveBtn.className = "introjs-skipbutton";
  saveBtn.onclick = function() {
     var containerElement = document.getElementById(idContainer);
     var videoMedia = containerElement.querySelector(".videoMedia");
     elem.properties.output.url = videoMedia.src;
     elem.properties.output.start = formatTime(videoMedia.getAttribute("start"));
     elem.properties.output.end = formatTime(videoMedia.getAttribute("end"));
     elem.properties.output.width = videoMedia.getAttribute("w");
     elem.properties.output.height = videoMedia.getAttribute("h");
     // Create a canvas element
     var timelineDiv = containerElement.querySelector(".timeline-div");
     if (timelineDiv) {
        // Get all the img elements within the div
        const imgElements = timelineDiv.querySelectorAll('img');
        // Extract the src attributes into an array
        elem.properties.output.preview = Array.from(imgElements).map(img => img.src);
     };
     elem.properties.output.stylePlay = containerElement.querySelector(".timeline-play-slider").style;
     elem.properties.output.styleTimeline = containerElement.querySelector(".timeline-div-slider").style;
     // Set the new buttonText property value for the button widget
     const buttonWidget = elem.widgets.find(widget => widget.type === "button");
     buttonWidget.name = "Edit";
     // Parameters
     removeWidgetsByType(elem, "static");  // Remove prev elements
     elem.addWidget("static", "Start", elem.properties.output.start, function(v) { this.value = elem.properties.output.start });
     elem.addWidget("static", "End", elem.properties.output.end, function(v) { this.value = elem.properties.output.end });
     elem.addWidget("static", "Width", elem.properties.output.width, function(v) { this.value = elem.properties.output.width });
     elem.addWidget("static", "Height", elem.properties.output.height, function(v) { this.value = elem.properties.output.height });
     // Set size of view TODO
     var ratioView = elem.properties.output.width / elem.properties.output.height
     if (ratioView > 1) {
        elem.size = [200 * ratioView, 200]
     } else {
        elem.size = [200, 200 / ratioView]
     };
     elem.setDirtyCanvas(true);
     introNode.exit();
  };
  saveElemI = document.createElement("i");
  saveElemI.className = "fa-solid fa-floppy-disk";
  saveBtn.append(saveElemI)
  document.querySelector('.introjs-tooltip-header').append(saveBtn);

  // Reload element
  reloadBtn = document.createElement("a");
  reloadBtn.className = "introjs-skipbutton";
  reloadBtn.onclick = function() {
    // Create input
    var inputVideo = document.createElement("input");
    inputVideo.type = "file";
    inputVideo.accept = "video/*";
    inputVideo.onchange = function(event) {
      handleVideoInput(event, elem.properties, idContainer, introNode);
    };
    inputVideo.click(); // Trigger file selection dialog
  };
  reloadElemI = document.createElement("i");
  reloadElemI.className = "fa-solid fa-rotate";
  reloadBtn.append(reloadElemI)
  document.querySelector('.introjs-tooltip-header').append(reloadBtn);
}

function removeWidgetsByType(node, typeToRemove) {
    const widgetsToRemove = node.widgets.filter(widget => widget.type === typeToRemove);
    for (let widgetToRemove of widgetsToRemove) {
        const widgetIndex = node.widgets.indexOf(widgetToRemove);
        node.widgets.splice(widgetIndex, 1);
    }
}

async function handleVideoInput(event, properties, idContainer, introNode) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    if (file) {
        const fileUrl = window.URL.createObjectURL(file);
        const fileType = file.type.split('/')[0];
        if (fileType === 'video') {
            loadVideoFromUrl(fileUrl, properties, idContainer, introNode);
        };
    }
};

async function loadVideoFromUrl(fileUrl, properties, idContainer, introNode) {
    var containerElement = document.getElementById(idContainer);
    containerElement.innerHTML = "";
    await setupVideoTimeline(containerElement, fileUrl, "50vh", "80vw");
    var videoMedia = containerElement.querySelector(".videoMedia");
    var timelineToggleLeft = containerElement.querySelector(".timeline-div-slider-toggle-left");
    var timelineToggleRight = containerElement.querySelector(".timeline-div-slider-toggle-right");
    var ldsRing = containerElement.querySelector(".lds-ring");
    if (ldsRing) {
        ldsRing.remove(); // Removes the load element
    }
    containerElement.querySelector(".canvasMedia").style.background = "";  // Remove background color
    if (fileUrl === properties.output.url) {
        videoMedia.setAttribute("start", convertTimeToSeconds(properties.output.start));
        if (properties.output.end !== "0") {
          videoMedia.setAttribute("end", convertTimeToSeconds(properties.output.end));
        };
        // Copy styles
        const playSlider = containerElement.querySelector(".timeline-play-slider");
        const timelineSlider = containerElement.querySelector(".timeline-div-slider");
        if (properties.output.stylePlay !== "") {
            playSlider.setAttribute("style", properties.output.stylePlay.cssText);
        }
        if (properties.output.styleTimeline !== "") {
            timelineSlider.setAttribute("style", properties.output.styleTimeline.cssText);
        }
    };
    // Refresh position
    introNode.refresh();
};
/// LOAD VIDEO NODE ///

/// SHOW MEDIA NODE TODO ///
function ImageFrame() {
    this.addInput("", "image,canvas");
    this.size = [200, 200];
    this.step = 0
    this.prevTime = 0;
    this.frame = new Image();
}

ImageFrame.title = "Frame";
ImageFrame.desc = "Frame view";
ImageFrame.widgets = [
    { name: "resize", text: "Resize box", type: "button" },
    { name: "view", text: "View Image", type: "button" }
];

ImageFrame.prototype.onDrawBackground = function(ctx) {
    if (this.frames) {
        if (!Array.isArray(this.frames)) {
            this.frames = [this.frames]; // Convert to an array if it's a single string
        }
        const now = Date.now();
        if (now - this.prevTime > 1000) {
            this.step = (this.step + 1) % this.frames.length; // Increment step and loop back to 0 if it exceeds the length
            this.prevTime = now;
        };
        this.frame.src = this.frames[this.step];
        if (this.frame && !this.flags.collapsed) {
            ctx.drawImage(this.frame, 0, 0, this.size[0], this.size[1]);
        }
    };
};

ImageFrame.prototype.onExecute = function() {
    this.frames = this.getInputData(0);
    this.setDirtyCanvas(true);
};

ImageFrame.prototype.onWidget = function(e, widget) {
    if (widget.name == "resize" && this.frame) {
        var width = this.frame.width;
        var height = this.frame.height;

        if (!width && this.frame.videoWidth != null) {
            width = this.frame.videoWidth;
            height = this.frame.videoHeight;
        }

        if (width && height) {
            this.size = [width, height];
        }
        this.setDirtyCanvas(true, true);
    } else if (widget.name == "view") {
        this.show();
    }
};

ImageFrame.prototype.show = function() {
    //var str = this.canvas.toDataURL("image/png");
    if (showElement && this.frame) {
        showElement(this.frame);
    }
};

LiteGraph.registerNodeType("Graphics/Frame", ImageFrame);
/// SHOW MEDIA NODE TODO ///