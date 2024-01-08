/// LOAD AUDIO NODE ///
function LoadAudioNode() {
    this.audio = new Audio();
    this.properties = {
        output: { url: "", start: 0, end: 0 }
    };
    this.addOutput("Out", "audio");
    this.addWidget("button", "Load", generateUniqueID(), this.onButtonClicked.bind(this));
}
LoadAudioNode.title = "Load Audio";
LoadAudioNode.desc = "Audio loader";
LoadAudioNode.supported_extensions = ["mp3", "wav"];
LoadAudioNode.prototype.onExecute = function() {
    this.setOutputData(0, this.properties.output);
}
LoadAudioNode.prototype.onButtonClicked = function () {
    var that = this;
    // Create input
    var inputAudio = document.createElement("input");
    inputAudio.type = "file";
    inputAudio.accept = "audio/*";
    inputAudio.onchange = function(event) {
      handleAudioInput(event, that);
    };
    inputAudio.click(); // Trigger file selection dialog
};
LoadAudioNode.prototype.onAudioClicked = function () {
    // Play
    if (this.audio.paused) {
       const buttonPlay = this.widgets.find(widget => widget.name === "Play");
       buttonPlay.name = "Stop";
       this.audio.play()
       // Update current time when audio starts playing
        this.audio.addEventListener('timeupdate', () => {
            const currentTime = this.audio.currentTime;
            if (currentTime < this.properties.output.start) {
                this.audio.currentTime = this.properties.output.start;
            } else if (currentTime >= this.properties.output.end) {
                this.audio.currentTime = this.properties.output.start;
            }
        });
    } else {
       const buttonStop = this.widgets.find(widget => widget.name === "Stop");
       buttonStop.name = "Play";
       this.audio.pause();
    }
};
LiteGraph.registerNodeType("Input/LoadAudio", LoadAudioNode);

function handleAudioInput(event, node) {
    const fileInput = event.target;
    const file = fileInput.files[0];
    if (file) {
        const fileUrl = window.URL.createObjectURL(file);
        const fileType = file.type.split('/')[0];
        if (fileType === 'audio') {
            // Create button
            removeWidgetsByType(node, "slider");  // Remove prev elements
            removeWidgetsByType(node, "button");
            node.addWidget("button", "Load", generateUniqueID(), node.onButtonClicked.bind(node));
            // Update parameters
            node.properties.output.url = fileUrl;
            // Create an Audio element
            const audio = new Audio();
            // Set up event listener for when the audio has loaded its metadata
            audio.addEventListener('loadedmetadata', function() {
                node.addWidget("button", "Play", generateUniqueID(), node.onAudioClicked.bind(node));
                // Access the audio duration (in seconds)
                const duration = audio.duration;
                node.properties.output.start = 0;
                node.properties.output.end = duration;
                node.addWidget("slider", "Start", 0, function(v) {
                    if (v > node.properties.output.end - 1) {
                        this.value = node.properties.output.end - 1;
                    } else if (v < 0) {
                        this.value = 0;
                    } else {
                        this.value = v;
                    }
                    node.properties.output.start = this.value;
                    if (node.audio.currentTime < this.value) {
                        node.audio.currentTime = this.value;
                    };
                }, { value: 0, min: 0, max: duration, text: "Start" });
                node.addWidget("slider", "End", duration, function(v) {
                    if (v < node.properties.output.start + 1) {
                        this.value = node.properties.output.start + 1;
                    } else if (v > duration) {
                        this.value = duration;
                    } else {
                        this.value = v;
                    }
                    node.properties.output.end = this.value;
                    if (node.audio.currentTime > this.value) {
                        node.audio.currentTime = node.properties.output.start;
                    };
                }, { value: 0, min: 0, max: duration, text: "End" });
            });
            // Set the audio source to start loading it
            audio.src = fileUrl;
            node.audio.src = fileUrl;
        }
    }
}
/// LOAD AUDIO NODE ///

/// AUDIO VISUAL NODE ///
/// AUDIO VISUAL NODE ///