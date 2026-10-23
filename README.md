# Crypto Market Dashboard

A responsive web dashboard that shows live prices for the top 50 cryptocurrencies, built with HTML, CSS and JavaScript.

**Live demo:** https://beggumuzun.github.io/crypto-dashboard/

## Features

- Live prices, 24h change and market cap from the CoinGecko API
- Search by coin name or symbol
- Sort by rank, price or 24h change
- Watchlist saved in the browser with localStorage, so it is kept after refreshing
- 7-day price chart for any coin, drawn with Chart.js
- Loading and error states when the API is unavailable
- Responsive layout for mobile and desktop

## Built with

- HTML, CSS and JavaScript (no frameworks)
- CoinGecko public API
- Chart.js
- Hosted with GitHub Pages

## How to run locally

Download the project and open `index.html` in a browser.

## What I learned

- Fetching data from a REST API with `fetch` and `async/await`
- Handling errors so the page does not break when a request fails
- Building the page dynamically by updating the DOM
- Filtering and sorting arrays of objects
- Saving user data in the browser with localStorage
