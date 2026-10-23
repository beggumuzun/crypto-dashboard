const API_URL = "https://api.coingecko.com/api/v3";
const CURRENCY = "gbp";

let coins = [];
let watchlist = loadWatchlist();
let showWatchlistOnly = false;
let chart = null;

const coinList = document.getElementById("coin-list");
const statusText = document.getElementById("status");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const watchlistButton = document.getElementById("watchlist-toggle");
const refreshButton = document.getElementById("refresh");
const chartSection = document.getElementById("chart-section");
const chartTitle = document.getElementById("chart-title");
const chartCloseButton = document.getElementById("chart-close");


// ---------- Data ----------

async function fetchCoins() {
    statusText.textContent = "Loading prices...";
    statusText.classList.remove("error");

    try {
        const url = `${API_URL}/coins/markets?vs_currency=${CURRENCY}&order=market_cap_desc&per_page=50&page=1`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        coins = await response.json();
        const time = new Date().toLocaleTimeString();
        statusText.textContent = `Last updated: ${time}`;
        renderCoins();
    } catch (error) {
        console.error(error);
        statusText.textContent = "Could not load prices. The API may be busy, please try again in a minute.";
        statusText.classList.add("error");
    }
}


// ---------- Display ----------

function formatPrice(value) {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
        maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
}

function formatMarketCap(value) {
    return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
        notation: "compact",
    }).format(value);
}

function getVisibleCoins() {
    const query = searchInput.value.trim().toLowerCase();

    let result = coins.filter(function (coin) {
        const matchesSearch =
            coin.name.toLowerCase().includes(query) ||
            coin.symbol.toLowerCase().includes(query);
        const matchesWatchlist = !showWatchlistOnly || watchlist.includes(coin.id);
        return matchesSearch && matchesWatchlist;
    });

    const sortBy = sortSelect.value;
    if (sortBy === "price") {
        result.sort((a, b) => b.current_price - a.current_price);
    } else if (sortBy === "change") {
        result.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    } else {
        result.sort((a, b) => a.market_cap_rank - b.market_cap_rank);
    }

    return result;
}

function renderCoins() {
    const visibleCoins = getVisibleCoins();
    coinList.innerHTML = "";

    if (visibleCoins.length === 0) {
        coinList.innerHTML = `<tr><td colspan="6">No coins found.</td></tr>`;
        return;
    }

    for (const coin of visibleCoins) {
        const change = coin.price_change_percentage_24h ?? 0;
        const changeClass = change >= 0 ? "positive" : "negative";
        const isSaved = watchlist.includes(coin.id);

        const row = document.createElement("tr");
        row.className = "coin-row";
        row.innerHTML = `
            <td><button class="star ${isSaved ? "saved" : ""}" title="Add to watchlist">★</button></td>
            <td>${coin.market_cap_rank}</td>
            <td>
                <div class="coin-name">
                    <img src="${coin.image}" alt="${coin.name} logo">
                    ${coin.name} <span class="symbol">${coin.symbol}</span>
                </div>
            </td>
            <td>${formatPrice(coin.current_price)}</td>
            <td class="${changeClass}">${change.toFixed(2)}%</td>
            <td class="hide-mobile">${formatMarketCap(coin.market_cap)}</td>
        `;

        row.querySelector(".star").addEventListener("click", function (event) {
            event.stopPropagation();
            toggleWatchlist(coin.id);
        });

        row.addEventListener("click", function () {
            showChart(coin);
        });

        coinList.appendChild(row);
    }
}


// ---------- Watchlist ----------

function loadWatchlist() {
    try {
        return JSON.parse(localStorage.getItem("watchlist")) || [];
    } catch (error) {
        return [];
    }
}

function saveWatchlist() {
    try {
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
    } catch (error) {
        console.error("Could not save watchlist", error);
    }
}

function toggleWatchlist(coinId) {
    if (watchlist.includes(coinId)) {
        watchlist = watchlist.filter((id) => id !== coinId);
    } else {
        watchlist.push(coinId);
    }
    saveWatchlist();
    renderCoins();
}


// ---------- Chart ----------

async function showChart(coin) {
    chartSection.classList.remove("hidden");
    chartTitle.textContent = `${coin.name}: last 7 days (loading...)`;
    chartSection.scrollIntoView({ behavior: "smooth" });

    try {
        const url = `${API_URL}/coins/${coin.id}/market_chart?vs_currency=${CURRENCY}&days=7`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const labels = data.prices.map((point) => new Date(point[0]).toLocaleDateString("en-GB"));
        const prices = data.prices.map((point) => point[1]);

        drawChart(labels, prices);
        chartTitle.textContent = `${coin.name}: last 7 days`;
    } catch (error) {
        console.error(error);
        chartTitle.textContent = `Could not load the chart for ${coin.name}. Please try again.`;
    }
}

function drawChart(labels, prices) {
    if (chart) {
        chart.destroy();
    }

    const context = document.getElementById("price-chart");
    chart = new Chart(context, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Price (GBP)",
                data: prices,
                borderColor: "#3b82f6",
                pointRadius: 0,
                tension: 0.2,
            }],
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { maxTicksLimit: 7, color: "#94a3b8" } },
                y: { ticks: { color: "#94a3b8" } },
            },
        },
    });
}


// ---------- Events ----------

searchInput.addEventListener("input", renderCoins);
sortSelect.addEventListener("change", renderCoins);
refreshButton.addEventListener("click", fetchCoins);

watchlistButton.addEventListener("click", function () {
    showWatchlistOnly = !showWatchlistOnly;
    watchlistButton.classList.toggle("active", showWatchlistOnly);
    watchlistButton.textContent = showWatchlistOnly ? "Show all coins" : "Show watchlist only";
    renderCoins();
});

chartCloseButton.addEventListener("click", function () {
    chartSection.classList.add("hidden");
});

fetchCoins();
