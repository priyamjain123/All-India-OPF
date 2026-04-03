const MAPS = [
    {
        id: "case-4-nr-active-power",
        label: "Case 4 NR Import Active Power LMPs",
        title: "Case 4 NR Import Active Power LMPs",
        candidateFiles: [
            "Case_4_NR_Import_active_power_lmps_all_india_grid.html",
            "maps/Case_4_NR_Import_active_power_lmps_all_india_grid.html"
        ]
    },
    {
        id: "case-2-sr-reactive-power",
        label: "Case 2 SR Import Reactive Power LMPs",
        title: "Case 2 SR Import Reactive Power LMPs",
        candidateFiles: [
            "Case_2_SR_Import_reactive_power_lmps_all_india_grid.html",
            "maps/Case_2_SR_Import_reactive_power_lmps_all_india_grid.html"
        ]
    }
];

const selector = document.getElementById("mapSelector");
const frame = document.getElementById("mapFrame");

let latestRenderRequest = 0;

function populateSelector() {
    MAPS.forEach((map) => {
        const option = document.createElement("option");
        option.value = map.id;
        option.textContent = map.label;
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

async function renderMap(mapId) {
    const requestId = ++latestRenderRequest;
    const selected = MAPS.find((map) => map.id === mapId);
    if (!selected) {
        return;
    }

    selector.value = selected.id;
    setQueryString(selected.id);

    const resolvedFile = await resolveMapFile(selected);
    if (requestId !== latestRenderRequest) {
        return;
    }

    frame.src = resolvedFile;
    frame.title = selected.title;
    document.title = `All India LMP Map - ${selected.title}`;
}

populateSelector();
renderMap(getSelectedIdFromUrl());

selector.addEventListener("change", (event) => {
    renderMap(event.target.value);
});
