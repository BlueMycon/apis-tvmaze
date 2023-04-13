"use strict";

const BASE_API_URL = "http://api.tvmaze.com/";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  // TODO: refactor axios call
  let response = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);
  let shows = response.data.map(elem => {
    return {
      "id": elem.show.id,
      "name": elem.show.name,
      "summary": elem.show.summary,
      "image": elem.show.image?.original || "https://tinyurl.com/tv-missing"
    };
  });
  return shows;
}


/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes" data-bs-toggle="modal" data-bs-target="#episodesModal">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}

$showsList.on("click", ".Show-getEpisodes", async function handleShowEpisodesButton(event) {
  const id = $(event.target).closest(".Show").data("show-id");
  await getEpisodesAndDisplay(id);
});

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm (evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(showId) {
  // TODO: more general axios request
  // const response = await axios.get(`http://api.tvmaze.com/shows/${showId}/episodes`);
  const response = await axios({
    baseURL: BASE_API_URL,
    url: `shows/${showId}/episodes`,
    method: "GET"
  });
  const episodes = response.data.map(({ id, name, season, number }) => {
    return ({ id, name, season, number });
  });
  
  return episodes;
 }

/** Given an array of Episodes, clear the episode list and display the episodes
 *
 * @param {array} episodes
 */

function displayEpisodes(episodes) {
  $("#episodesList").empty();

  for (let episode of episodes) {
    const { name, season, number } = episode;
    $("#episodesList").append(`<li>${name} (Season ${season}, Episode ${number})</li>`);
  }

  // const displayStyle = $episodesArea.css("display");
  // if (displayStyle === "none") {
  //   $episodesArea.css("display", "");
  // }

  // $episodesArea.show();
}

/** Given a show ID, get from API and display episode list
 *
 * @param {nummber} showId
 */

async function getEpisodesAndDisplay(showId) {
  const episodes = await getEpisodesOfShow(showId);
  displayEpisodes(episodes);
}

