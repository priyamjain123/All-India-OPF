const REPO_OWNER = "priyamjain123";
const REPO_NAME = "All-India-OPF";
const CONTENTS_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/`;

const FALLBACK_FILES = [
    "NR Import Case-1_Copper Plate Scenario.html",
    "NR Import Case-2_Interface + Voltage Limits.html",
    "NR Import Case-3 Branch Flow + Voltage Limits.html",
    "NR Import Case-4 Interface + Branch Flow + Voltage Limits (Reduced ATC Case).html",
    "SR Import Case-1_Copper Plate Scenario.html",
    "SR Import Case-2_Interface + Voltage Limits.html",
    "SR Import Case-3 Branch Flow + Voltage Limits.html",
    "SR Import Case-4 Interface + Branch Flow + Voltage Limits (Reduced ATC Case).html"
];

const selector = document.getElementById("mapSelector");
const showMapButton = document.getElementById("showMapButton");
const frame = document.getElementById("mapFrame");
const selectedMapTitle = document.getElementById("selectedMapTitle");
const mapStatus = document.getElementById("mapStatus");
const mapPlaceholder = document.getElementById("mapPlaceholder");

let maps = [];

function slugify(value) {
    return value
        .toLowerCase()
        .replace(/\.html$/i, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function formatLabel(filename) {
    return filename
        .replace(/\.html$/i, "")
        .replace(/_/g, " | ")
        .replace(/Case-(\d+)/gi, "Case $1");
}

function createMapEntry(filename) {
    return {
        id: slugify(filename),
        label: formatLabel(filename),
        title: filename.replace(/\.html$/i, "").replace(/_/g, " "),
        file: filename
    };
}

function sortMaps(left, right) {
    return left.label.localeCompare(right.label, undefined, { numeric: true, sensitivity: "base" });
}

function setQueryString(mapId) {
    const url = new URL(window.location.href);
    url.searchParams.set("map", mapId);
    window.history.replaceState({}, "", url);
}

function getSelectedIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("map");
}

function getSelectedMap() {
    return maps.find((map) => map.id === selector.value) || maps[0] || null;
}

function renderSelectorOptions() {
    selector.innerHTML = "";

    maps.forEach((map) => {
        const option = document.createElement("option");
        option.value = map.id;
        option.textContent = map.label;
        selector.appendChild(option);
    });

    const requestedId = getSelectedIdFromUrl();
    const initialMap = maps.find((map) => map.id === requestedId) || maps[0] || null;

    if (initialMap) {
        selector.value = initialMap.id;
    }
}

function resetStage(message = "Ready") {
    const selected = getSelectedMap();
    selectedMapTitle.textContent = selected ? selected.title : "No scenario maps found";
    mapStatus.textContent = message;
    mapPlaceholder.classList.remove("hidden");
    frame.removeAttribute("src");
    frame.title = "All India LMP map viewer";
    document.title = "All India LMP Map";
}

function loadMap() {
    const selected = getSelectedMap();
    if (!selected) {
        selectedMapTitle.textContent = "No scenario maps found";
        mapStatus.textContent = "Unavailable";
        return;
    }

    mapStatus.textContent = "Loading";
    selectedMapTitle.textContent = selected.title;
    mapPlaceholder.classList.add("hidden");
    frame.src = encodeURI(selected.file);
    frame.title = selected.title;
    document.title = `All India LMP Map - ${selected.title}`;
    setQueryString(selected.id);
}

async function fetchRepoMaps() {
    const response = await fetch(CONTENTS_API, {
        headers: { Accept: "application/vnd.github+json" }
    });

    if (!response.ok) {
        throw new Error(`GitHub API returned ${response.status}`);
    }

    const contents = await response.json();
    return contents
        .filter((item) => item.type === "file")
        .filter((item) => item.name.toLowerCase().endsWith(".html"))
        .filter((item) => item.name.toLowerCase() !== "index.html")
        .map((item) => createMapEntry(item.name))
        .sort(sortMaps);
}

function getFallbackMaps() {
    return FALLBACK_FILES.map((filename) => createMapEntry(filename)).sort(sortMaps);
}

async function initializePage() {
    selector.disabled = true;
    showMapButton.disabled = true;
    mapStatus.textContent = "Loading cases";

    try {
        maps = await fetchRepoMaps();
    } catch (error) {
        maps = getFallbackMaps();
    }

    renderSelectorOptions();
    selector.disabled = maps.length === 0;
    showMapButton.disabled = maps.length === 0;

    if (maps.length === 0) {
        resetStage("Unavailable");
        return;
    }

    resetStage("Ready");
}

showMapButton.addEventListener("click", loadMap);
selector.addEventListener("change", () => resetStage("Ready"));

frame.addEventListener("load", () => {
    const selected = getSelectedMap();
    mapStatus.textContent = "Loaded";
    if (selected) {
        selectedMapTitle.textContent = selected.title;
    }
});

initializePage();
