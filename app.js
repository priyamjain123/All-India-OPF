const MAPS = [
    {
        id: "case-4-nr-active-power",
        label: "Case 4 | NR Import | Active Power LMPs",
        title: "Case 4 NR Import Active Power LMPs",
        file: "Case_4_NR_Import_active_power_lmps_all_india_grid.html"
    },
    {
        id: "case-2-sr-reactive-power",
        label: "Case 2 | SR Import | Reactive Power LMPs",
        title: "Case 2 SR Import Reactive Power LMPs",
        file: "Case_2_SR_Import_reactive_power_lmps_all_india_grid.html"
    }
];

const selector = document.getElementById("mapSelector");
const showMapButton = document.getElementById("showMapButton");
const frame = document.getElementById("mapFrame");
const selectedMapTitle = document.getElementById("selectedMapTitle");
const mapStatus = document.getElementById("mapStatus");
const mapPlaceholder = document.getElementById("mapPlaceholder");

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

function getSelectedMap() {
    return MAPS.find((map) => map.id === selector.value) || MAPS[0];
}

function resetStage() {
    const selected = getSelectedMap();
    selectedMapTitle.textContent = selected.title;
    mapStatus.textContent = "Ready";
    mapPlaceholder.classList.remove("hidden");
    frame.removeAttribute("src");
    frame.title = "All India LMP map viewer";
    document.title = "All India LMP Map";
}

function loadMap() {
    const selected = getSelectedMap();
    selector.value = selected.id;
    selectedMapTitle.textContent = selected.title;
    mapStatus.textContent = "Loading";
    mapPlaceholder.classList.add("hidden");
    frame.src = selected.file;
    frame.title = selected.title;
    document.title = `All India LMP Map - ${selected.title}`;
    setQueryString(selected.id);
}

populateSelector();
selector.value = getSelectedIdFromUrl();
resetStage();

showMapButton.addEventListener("click", loadMap);
selector.addEventListener("change", resetStage);

frame.addEventListener("load", () => {
    const selected = getSelectedMap();
    mapStatus.textContent = "Loaded";
    selectedMapTitle.textContent = selected.title;
});
