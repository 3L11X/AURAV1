const results_container = document.querySelector("#saavn-results");
const results_objects = {};
const searchUrl = "https://jiosaavn-api-privatecvc.vercel.app/search/songs?query=";
let lastSearch = "";
let page_index = 1;

function SaavnSearch(event) {
    event.preventDefault();
    const query = document.querySelector("#saavn-search-box").value.trim();
    const encodedQuery = encodeURIComponent(query);

    if (encodedQuery === lastSearch) {
        doSaavnSearch(encodedQuery);
    }

    window.location.hash = encodedQuery;
}

function nextPage() {
    const query = document.querySelector("#saavn-search-box").value.trim() || lastSearch;
    const encodedQuery = encodeURIComponent(query);
    doSaavnSearch(encodedQuery, 0, true);
}

async function doSaavnSearch(query, NotScroll, page) {
    window.location.hash = query;
    document.querySelector("#saavn-search-box").value = decodeURIComponent(query);

    if (!query) {
        return 0;
    }

    results_container.innerHTML = `<span class="loader">Searching</span>`;
    const queryWithLimit = `${query}&limit=40`;

    if (page) {
        page_index += 1;
        queryWithLimit += `&page=${page_index}`;
    } else {
        page_index = 1;
    }

    try {
        const response = await fetch(searchUrl + queryWithLimit);
        const json = await response.json();

        if (response.status !== 200) {
            results_container.innerHTML = `<span class="error">Error: ${json.message}</span>`;
            return;
        }

        const results = json.data.results;

        if (!results) {
            results_container.innerHTML = "<p>No result found. Try another library</p>";
            return;
        }

        lastSearch = decodeURI(window.location.hash.substring(1));

        const htmlResults = results.map(track => {
            const song_name = TextAbstract(track.name, 25);
            const album_name = TextAbstract(track.album.name, 20);
            // ... (continue building the HTML for each result)
        });

        results_container.innerHTML = htmlResults.join(' ');

        if (!NotScroll) {
            document.getElementById("saavn-results").scrollIntoView();
        }
    } catch (error) {
        results_container.innerHTML = `<span class="error">Error: ${error}<br>Check if API is down</span>`;
    }
}

function TextAbstract(text, length) {
    if (text == null) {
        return "";
    }
    if (text.length <= length) {
        return text;
    }
    text = text.substring(0, length);
    last = text.lastIndexOf(" ");
    text = text.substring(0, last);
    return text + "...";
}

// Initialize with a default search
if (window.location.hash) {
    doSaavnSearch(window.location.hash.substring(1));
} else {
    doSaavnSearch('english', 1);
}

addEventListener('hashchange', event => { });
onhashchange = event => { doSaavnSearch(window.location.hash.substring(1)) };

// If Bitrate changes, search again
$('#saavn-bitrate').on('change', function () {
    doSaavnSearch(lastSearch);
});

document.getElementById("loadmore").addEventListener('click', nextPage);
