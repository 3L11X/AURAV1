const resultsContainer = document.querySelector("#saavn-results");
const resultsObjects = {};
const searchUrl = "https://jiosaavn-api-privatecvc.vercel.app/search/songs?query=";
let lastSearch = "";
let pageIndex = 1;

function saavnSearch(event) {
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

async function doSaavnSearch(query, notScroll, page) {
    window.location.hash = query;
    document.querySelector("#saavn-search-box").value = decodeURIComponent(query);

    if (!query) {
        return 0;
    }

    resultsContainer.innerHTML = `<span class="loader">Searching</span>`;
    let queryWithLimit = `${query}&limit=40`;

    if (page) {
        pageIndex += 1;
        queryWithLimit += `&page=${pageIndex}`;
    } else {
        pageIndex = 1;
    }

    try {
        const response = await fetch(searchUrl + queryWithLimit);
        const json = await response.json();

        if (response.status !== 200) {
            resultsContainer.innerHTML = `<span class="error">Error: ${json.message}</span>`;
            return;
        }

        const results = json.data.results;

        if (!results) {
            resultsContainer.innerHTML = "<p>No result found. Try another library</p>";
            return;
        }

        lastSearch = decodeURI(window.location.hash.substring(1));

        const htmlResults = results.map(track => {
            const songName = textAbstract(track.name, 25);
            const albumName = textAbstract(track.album.name, 20);
            // ... (continue building the HTML for each result)
        });

        resultsContainer.innerHTML = htmlResults.join(' ');

        if (!notScroll) {
            document.getElementById("saavn-results").scrollIntoView();
        }
    } catch (error) {
        resultsContainer.innerHTML = `<span class="error">Error: ${error}<br>Check if API is down</span>`;
    }
}

function textAbstract(text, length) {
    if (text == null) {
        return "";
    }
    if (text.length <= length) {
        return text;
    }
    text = text.substring(0, length);
    const lastSpace = text.lastIndexOf(" ");
    text = text.substring(0, lastSpace);
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
