const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
let filteredMovies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const MOVIES_PER_PAGE = 12
const paginator = document.querySelector('#paginator')


function resetMovieModal() {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  modalTitle.innerText = ''
  modalDate.innerText = 'Release date: '
  modalDescription.innerText = ''
  modalImage.innerHTML = ``
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response)=> {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })

}

function renderMovieList(data) {
  let rawHTML = ''
  data.forEach(item => {
    //title, image
    rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
  });
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page ++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMovieByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  // page 1 => 1~12 data[0]~data[11]    data.slice(0,12)
  // page 2 => 13~24 data[12]~data[23]  data.slice(12,24)
  // page 3 => 25~36 data[24]~data[35]  data.slice(24,36)
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find( (movie) => movie.id === id)
  console.log(id)
  console.log(movie)
  if (!movie) {
    return console.log(`????????? id ??? ${id} ?????????`)
  }
  if (list.some((movie) => movie.id === id)) {
    return alert('????????????????????????????????????')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    resetMovieModal()
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMovieByPage(page))

})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //??????submit????????????????????????????????????????????????
  event.preventDefault()
  //??????input??????????????????
  const keyword = searchInput.value.trim().toLowerCase()

  //???????????????for-of????????????
  // for ( const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //     renderMovieList(filteredMovies)
  //   }
  // }
  //???????????????????????????????????????filter()
  filteredMovies = movies.filter( movie => movie.title.toLowerCase().includes(keyword) )

  //???????????????????????????????????????
  if (filteredMovies.length === 0) {
    return alert(`????????????????????????${keyword}?????????????????????????????????`)
  }
  renderPaginator(filteredMovies.length)
  renderMovieList(getMovieByPage(1))
})

axios.get(INDEX_URL)
  .then((response) => {
    // handle success
    movies.push(...response.data.results);
    renderPaginator(movies.length)
    renderMovieList(getMovieByPage(1))
  })
  .catch((error) => {
    // handle error
    console.log(error);
  })

