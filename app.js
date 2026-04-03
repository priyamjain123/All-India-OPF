const MAPS = [
    {
        id: "case-4-nr-active-power",
        title: "Case 4 NR Import Active Power LMPs",
        caseName: "Case 4",
        region: "NR Import",
        metric: "Active Power LMPs",
        description: "National grid view for the NR import case using active-power LMP values. Use the embedded Folium controls to zoom, pan, and inspect individual locations.",
        candidateFiles: [
            "Case_4_NR_Import_active_power_lmps_all_india_grid.html",
            "maps/Case_4_NR_Import_active_power_lmps_all_india_grid.html"
        ]
    },
    {
        id: "case-2-sr-reactive-power",
        title: "Case 2 SR Import Reactive Power LMPs",
        caseName: "Case 2",
        region: "SR Import",
        metric: "Reactive Power LMPs",
        description: "National grid view for the SR import case using reactive-power LMP values. Hover and click within the map to inspect bus-level values already baked into the source HTML.",
        candidateFiles: [
            "Case_2_SR_Import_reactive_power_lmps_all_india_grid.html",
            "maps/Case_2_SR_Import_reactive_power_lmps_all_india_grid.html"
        ]
    }
];

const selector = document.getElementById("mapSelector");
const previousButton = document.getElementById("previousMap");
const nextButton = document.getElementById("nextMap");
const copyButton = document.getElementById("copyShareLink");
const frame = document.getElementById("mapFrame");
const openSelectedMap = document.getElementById("openSelectedMap");
const directMapLink = document.getElementById("directMapLink");
const mapTitle = document.getElementById("mapTitle");
const mapStatus = document.getElementById("mapStatus");
const detailCase = document.getElementById("detailCase");
const detailRegion = document.getElementById("detailRegion");
const detailMetric = document.getElementById("detailMetric");
const detailFilename = document.getElementById("detailFilename");
const mapDescription = document.getElementById("mapDescription");

let latestRenderRequest = 0;

function populateSelector() {
    MAPS.forEach((map) => {
        const option = document.createElement("option");
        option.value = map.id;
        option.textContent = `${map.caseName} | ${map.region} | ${map.metric}`;
        selector.appendChild(option);
    });
}

function getSelectedIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get("map");
    return MAPS.some((map) => map.id === requestedId) ? requestedId : MAPS[0].id;
}

function setQueryString(mapId) {
    const url = new URL(window.location.href);
    url.searchParams.set("map", mapId);
    window.history.replaceState({}, "", url);
}

function updateNavigation(currentIndex) {
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === MAPS.length - 1;
    previousButton.dataset.targetId = currentIndex > 0 ? MAPS[currentIndex - 1].id : "";
    nextButton.dataset.targetId = currentIndex < MAPS.length - 1 ? MAPS[currentIndex + 1].id : "";
}

async function fileExists(path) {
    try {
        const response = await fetch(path, {
            method: "HEAD",
            cache: "no-store"
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

async function resolveMapFile(selected) {
    for (const candidate of selected.candidateFiles) {
        const exists = await fileExists(candidate);
        if (exists) {
            return candidate;
        }
    }

    return selected.candidateFiles[0];
}

function applyResolvedMap(selected, resolvedFile, currentIndex) {
    frame.src = resolvedFile;
    openSelectedMap.href = resolvedFile;
    directMapLink.href = resolvedFile;
    directMapLink.textContent = `Open ${selected.caseName} in a full tab`;
    mapTitle.textContent = selected.title;
    mapStatus.textContent = `${currentIndex + 1} of ${MAPS.length}`;
    detailCase.textContent = selected.caseName;
    detailRegion.textContent = selected.region;
    detailMetric.textContent = selected.metric;
    detailFilename.textContent = resolvedFile.split("/").pop();
    mapDescription.textContent = selected.description;
}

async function renderMap(mapId) {
    const requestId = ++latestRenderRequest;
    const currentIndex = MAPS.findIndex((map) => map.id === mapId);
    const selected = MAPS[currentIndex];
    if (!selected) {
        return;
    }

    selector.value = selected.id;
    setQueryString(selected.id);
    updateNavigation(currentIndex);
    mapTitle.textContent = selected.title;
    mapStatus.textContent = "Checking map file...";
    detailCase.textContent = selected.caseName;
    detailRegion.textContent = selected.region;
    detailMetric.textContent = selected.metric;
    detailFilename.textContent = "Resolving file path";
    mapDescription.textContent = selected.description;

    const resolvedFile = await resolveMapFile(selected);
    if (requestId !== latestRenderRequest) {
        return;
    }

    applyResolvedMap(selected, resolvedFile, currentIndex);
}

async function copyShareLink() {
    try {
        await navigator.clipboard.writeText(window.location.href);
        mapStatus.textContent = "Link copied";
    } catch (error) {
        mapStatus.textContent = "Copy failed";
    } finally {
        window.setTimeout(() => {
            const currentId = selector.value;
            const currentIndex = MAPS.findIndex((map) => map.id === currentId);
            mapStatus.textContent = `${currentIndex + 1} of ${MAPS.length}`;
        }, 1800);
    }
}

populateSelector();
renderMap(getSelectedIdFromUrl());

selector.addEventListener("change", (event) => {
    renderMap(event.target.value);
});

previousButton.addEventListener("click", () => {
    if (previousButton.dataset.targetId) {
        renderMap(previousButton.dataset.targetId);
    }
});

nextButton.addEventListener("click", () => {
    if (nextButton.dataset.targetId) {
        renderMap(nextButton.dataset.targetId);
    }
});

copyButton.addEventListener("click", copyShareLink);
