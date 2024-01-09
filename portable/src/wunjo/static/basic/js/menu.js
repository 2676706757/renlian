/// OPEN FOLDER ///
const link = document.getElementById("a-open-folder");
link.addEventListener("click", (event) => {
  event.preventDefault(); // prevent the link from following its href attribute
  fetch("/open_folder", { method: "POST" })
    .then((response) => {
      if (response.ok) {
        // handle the successful response from the server
      } else {
        throw new Error("Network response was not ok.");
      }
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
});
/// OPEN FOLDER ///

///CHANGE INTERNET MODE///
function changeInternetMode(elem) {
  fetch('/change_internet_mode', {
    method: 'POST'
  })
  .then(response => response.json())
  .then(data => {
    const useOffline = data.use_offline;
    if (useOffline === false) {
      elem.style.color = '#18a518';  // green
    } else {
      elem.style.color = '#656565';  // red (gray)
    }
  })
  .catch(error => {
    console.error('Error:', error);
    // Handle errors here
  });
};

function getInternetMode(elem) {
  fetch('/get_internet_mode', {
    method: 'POST'
  })
  .then(response => response.json())
  .then(data => {
    const useOffline = data.use_offline;
    if (useOffline === false) {
      elem.style.color = '#18a518';  // green
    } else {
      elem.style.color = '#656565';  // red (gray)
    }
  })
  .catch(error => {
    console.error('Error:', error);
    // Handle errors here
  });
};
getInternetMode(document.getElementById("a-change-internet"));
///CHANGE INTERNET MODE///

/// CURRENT PROCESSOR ///
const processor = document.getElementById("a-change-processor");
processor.addEventListener("click", (event) => {
  event.preventDefault(); // prevent the link from following its href attribute
  fetch("/change_processor", { method: "POST" })
    .then((response) => response.json())
    .then((data) => {
      currentProcessor();
    })
    .catch((error) => {
      console.log(error);
    });
});

function availableFeaturesByCUDA(elem = undefined) {
  // inspect what can be use torch cuda is available
  fetch("/current_processor", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      var deviceStatus = data.current_processor;
      var deviceUpgrade = data.upgrade_gpu;
      if (elem && deviceStatus == "cuda") {
        elem.style.display = "block";
      } else if (elem) {
        elem.style.display = "none";
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function currentProcessor() {
  fetch("/current_processor", { method: "GET" })
    .then((response) => response.json())
    .then((data) => {
      var deviceStatus = data.current_processor;
      var deviceUpgrade = data.upgrade_gpu;
      if (deviceStatus == "cuda") {
        processor.style.color = '#18a518';  // green
      } else {
        processor.style.color = '#656565';  // red (gray)
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

currentProcessor();
/// CURRENT PROCESSOR ///

///GET DISK SPACE AND RAM USED///
function getSystemResourcesStatus() {
  fetch("/system_resources_status/")
    .then((response) => response.json())
    .then((data) => {
      // Assuming the sizes are in bytes, convert them to MB and round to 1 decimal place
      const driveSizeMB = data.drive.toFixed(1);

      // Set the content for the HTML elements
      document.getElementById(
        "content-drive-space"
      ).textContent = `.wunjo/content ${driveSizeMB} Mb,`;
    })
    .catch((error) => {
      console.error("Error fetching disk space used:", error);
    });
}
// Init message about disk space used
getSystemResourcesStatus();
// Update information about disk space used each 10 seconds
setInterval(getSystemResourcesStatus, 10000);
///GET DISK SPACE AND RAM USED///

///UPDATE VERSION///
// Convert version string to array for easy comparison
function versionUpdateToArray(version) {
  return version.split('.').map(num => parseInt(num, 10));
}

function isVersionGreater(currentVersionArray, checkVersionArray) {
  for (let i = 0; i < currentVersionArray.length; i++) {
    if (checkVersionArray[i] > currentVersionArray[i]) {
      return true;
    } else if (checkVersionArray[i] < currentVersionArray[i]) {
      return false;
    }
  }
  return false; // If all parts are equal, the version is not greater.
}

function updateVersion(serverVersionData) {
  // Parse the version data passed from the server
  let serverVersionDataJSON = JSON.parse(serverVersionData);
  if (
    Object.keys(serverVersionDataJSON).length !== 0 &&
    serverVersionDataJSON.hasOwnProperty("version")
  ) {
    let serverVersion = serverVersionDataJSON.version;
    let currentVersion = document.getElementById("version").getAttribute("vers");
    let currentVersionArray = versionUpdateToArray(currentVersion);

    // Compare the server version with the current version
    if (isVersionGreater(currentVersionArray, versionUpdateToArray(serverVersion))) {
      let allVersionHistory = serverVersionDataJSON.history;

      // Filter versions that are greater than the current version
      let filteredVersions = Object.keys(allVersionHistory)
        .filter(version => isVersionGreater(currentVersionArray, versionUpdateToArray(version)))
        .sort((a, b) => {
          let versionArrayA = versionUpdateToArray(a);
          let versionArrayB = versionUpdateToArray(b);
          return versionArrayB.join('.') - versionArrayA.join('.');
        });

      // Build the HTML for the update info
      let htmlUpdateInfo = "";
      filteredVersions.forEach(version => {
        htmlUpdateInfo += `<h3>${version}</h3><ul style="padding: 0;list-style-type: none;">`;
        let items = allVersionHistory[version];
        items.forEach(item => {
          htmlUpdateInfo += `<li>- ${item}</li>`;
        });
        htmlUpdateInfo += `</ul>`;
      });

      // Update the version information in the HTML
      document.getElementById("version").style.display = "";
      document.getElementById("update-tab").innerHTML = htmlUpdateInfo;
    };
  };
};

updateVersion(serverVersionData);
///UPDATE VERSION///

///PANEL ACTIVATE///
// Get all tabs and tab content
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Add click event listeners to tabs
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetId = tab.getAttribute('data-target');

    // Remove active class from all tabs and hide all tab contents
    tabs.forEach(tab => tab.classList.remove('active'));
    tabContents.forEach(content => content.style.display = 'none');

    // Add active class to the clicked tab and display related tab content
    tab.classList.add('active');
    document.getElementById(targetId).style.display = 'block';
  });
});
///PANEL ACTIVATE///

///FILE WORK LOGICAL///
function saveWorkflow(parentElem) {
  let serializedGraph = graph.serialize()
  // Loop through nodes in the serialized data
  for (let i = 0; i < serializedGraph.nodes.length; i++) {
    let node = serializedGraph.nodes[i];

    // Check if the node type is "Input/LoadVideo"
    if (node.type === "Input/LoadVideo") {
        // Modify properties for nodes of type "Input/LoadVideo"
        node.properties = {  output: {
                url: "",
                preview: [""],
                start: "00:00:00.000",
                end: "00:00:00.000",
                width: 0,
                height: 0,
                stylePlay: "",
                styleTimeline: ""
            }
        };
        node.size = [];
    }
  }
  let saveConfigData = JSON.stringify(serializedGraph);
  let blob = new Blob([saveConfigData], { type: 'application/json' });
  let url = URL.createObjectURL(blob);
  // Create a temporary <a> element to trigger the download
  let a = document.createElement('a');
  a.href = url;
  a.download = 'workflow.json';
  a.click();

  // Cleanup
  URL.revokeObjectURL(url);
  // Close div
  parentElem.style.display = "none";
};

function loadWorkflow(parentElem, event) {
  let file = event.target.files[0];
  if (!file) return;

  let reader = new FileReader();
  reader.onload = function(event) {
    let content = event.target.result;
    let loadConfigData = JSON.parse(content);
    graph.configure(loadConfigData);
  };
  reader.readAsText(file);
  // Close div
  parentElem.style.display = "none";
}

function clearWorkflow(parentElem) {
  graph.clear();
  // Close div
  parentElem.style.display = "none";
};

function rendoWorkflow() {
  if (graphStep < graphHistory.length - 1) {
    graphStep++;
    lastSerializedState = graphHistory[graphStep];
    graph.configure(lastSerializedState);
  }
}

function undoWorkflow() {
  if (graphStep > 0) {
    graphStep--;
    lastSerializedState = graphHistory[graphStep];
    graph.configure(lastSerializedState);
  }
}

function toposortNodes() {
    // setup dagre and sort nodes
    var dagreGraph = new dagre.graphlib
        .Graph()
        .setGraph({
            "rankdir": "LR", // left to right
            "ranker": "network-simplex", // values: "network-simplex", "tight-tree", "longest-path"
            "nodesep": 100, // spacing in same column, can be changed
            "ranksep": 200, // spacing between columns, can be changed
        });

    // convert litegraph to dagre
    graph._nodes.forEach((n) => dagreGraph.setNode(
        `cytoN-${n.id}`,
        {
            "label": n.type,
            "width": n.size[0],
            "height": n.size[1]
        }
    ));
    if (Object.keys(graph.links).length !== 0) {
        graph.links.forEach((e) => dagreGraph.setEdge(
            `cytoN-${e.origin_id}`,
            `cytoN-${e.target_id}`,
            { "label": e.type }
        ));
    };
    dagre.layout(dagreGraph);

    // retrieve nodes position
    for (let n of graph._nodes) {
        const cytoN = dagreGraph.node(`cytoN-${n.id}`);
        n.pos[0] = cytoN.x;
        n.pos[1] = cytoN.y;
    }
};

const fileSelectBtn = document.getElementById('file-select-btn');
const fileSelect = document.getElementById('file-select');
let timeoutFileSelectId;  // Time out for clear file select display

fileSelectBtn.addEventListener('mouseover', () => {
  clearTimeout(timeoutFileSelectId);
  fileSelect.style.display = 'flex';
});

fileSelectBtn.addEventListener('mouseout', () => {
  clearTimeout(timeoutFileSelectId);
  timeoutFileSelectId = setTimeout(() => { fileSelect.style.display = 'none'; }, 1000);
});

fileSelect.addEventListener('mouseover', () => {
  clearTimeout(timeoutFileSelectId);
  fileSelect.style.display = 'flex';
});

fileSelect.addEventListener('mouseout', () => {
  clearTimeout(timeoutFileSelectId);
  timeoutFileSelectId = setTimeout(() => { fileSelect.style.display = 'none'; }, 1000);
});
///FILE WORK LOGICAL///

///GENERATE UNIQ NAME///
// Function to generate a unique ID
function generateUniqueID(length=20) {
  return Math.random().toString(36).substr(2, length);
}
///GENERATE UNIQ NAME///