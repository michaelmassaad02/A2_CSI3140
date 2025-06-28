// Global array to hold all movie objects
let movies = [];

// ======= Initialization =======
window.onload = function () {
    loadMovies();
    renderMovies();
};

// ======= Load and Save =======
function loadMovies() {
    const stored = localStorage.getItem("movies");
    if (stored) {
        movies = JSON.parse(stored);
    }
}

function saveMovies() {
    localStorage.setItem("movies", JSON.stringify(movies));
}

// ======= Add Movie =======
document.getElementById("addMovieButton").addEventListener("click", handleAddMovie);

let currentRating = 0;
const addStars = document.querySelectorAll("#starRating .star");

addStars.forEach(star => {
    star.addEventListener("mouseover", () => {
        const val = parseInt(star.dataset.value);
        updateStarVisual(addStars, val);
    });

    star.addEventListener("mouseout", () => {
        updateStarVisual(addStars, currentRating);
    });

    star.addEventListener("click", () => {
        currentRating = parseInt(star.dataset.value);
        updateStarVisual(addStars, currentRating);
    });
});

function updateStarVisual(starsNodeList, upTo) {
    starsNodeList.forEach(star => {
        const val = parseInt(star.dataset.value);
        if (val <= upTo) {
            star.classList.add("selected");
        } else {
            star.classList.remove("selected");
        }
    });
}

function handleAddMovie() {
    const title = document.getElementById("movieTitle").value.trim();
    const genre = document.getElementById("movieGenre").value;

    if (!title || currentRating === 0) return;

    const movie = {
        id: Date.now(),
        title,
        genre,
        rating: currentRating,
        watched: false
    };

    movies.push(movie);
    saveMovies();
    renderMovies();
    clearForm();
}

function clearForm() {
    document.getElementById("movieTitle").value = "";
    document.getElementById("movieGenre").selectedIndex = 0;
    currentRating = 0;
    updateStarVisual(addStars, 0);
}

// ======= Render Movies =======
function renderMovies(filtered = null) {
    const container = document.getElementById("movieList");
    container.innerHTML = "";

    const displayList = filtered || movies;

    for (let movie of displayList) {
        const card = document.createElement("div");
        card.className = "movie-card";
        if (movie.watched) card.classList.add("watched");

        card.innerHTML = `
        <h3>${movie.title}</h3>
        <div class="stars">${"★".repeat(movie.rating)}${"☆".repeat(5 - movie.rating)}</div>
        <div class="genre-badge">${movie.genre}</div>
        <div class="icon-buttons">
            <button class="icon-btn edit-btn" title="Edit" data-id="${movie.id}">✏️</button>
            ${!movie.watched ? `<button class="icon-btn watch-btn" title="Mark as Watched" data-id="${movie.id}">✅</button>` : ""}
            <button class="icon-btn remove-btn" title="Remove" data-id="${movie.id}">❌</button>
        </div>
        `;


        container.appendChild(card);
    }
}

// ======= Event Delegation =======
document.getElementById("movieList").addEventListener("click", function (e) {
    const id = Number(e.target.dataset.id);
    if (e.target.classList.contains("remove-btn")) {
        movies = movies.filter(m => m.id !== id);
        saveMovies();
        renderMovies();
    } else if (e.target.classList.contains("watch-btn")) {
        const m = movies.find(m => m.id === id);
        m.watched = !m.watched;
        saveMovies();
        renderMovies();
    } else if (e.target.classList.contains("edit-btn")) {
        openEditModal(id);
    }
});

// ======= Edit Movie =======
let editingId = null;
let currentEditRating = 0;
const editStars = document.querySelectorAll("#editStarRating .star");

editStars.forEach(star => {
    star.addEventListener("mouseover", () => {
        const val = parseInt(star.dataset.value);
        updateStarVisual(editStars, val);
    });

    star.addEventListener("mouseout", () => {
        updateStarVisual(editStars, currentEditRating);
    });

    star.addEventListener("click", () => {
        currentEditRating = parseInt(star.dataset.value);
        updateStarVisual(editStars, currentEditRating);
    });
});

function openEditModal(id) {
    const movie = movies.find(m => m.id === id);
    if (!movie) return;

    editingId = id;
    currentEditRating = movie.rating;

    document.getElementById("editTitle").value = movie.title;
    document.getElementById("editGenre").value = movie.genre;
    updateStarVisual(editStars, currentEditRating);

    document.getElementById("editModal").classList.add("show");
}

function closeEditModal() {
    document.getElementById("editModal").classList.remove("show");
}

document.getElementById("closeModal").addEventListener("click", closeEditModal);
document.getElementById("cancelEditBtn").addEventListener("click", closeEditModal);
document.getElementById("saveChangesBtn").addEventListener("click", saveEditChanges);

function saveEditChanges() {
    const movie = movies.find(m => m.id === editingId);
    if (!movie) return;

    movie.title = document.getElementById("editTitle").value.trim();
    movie.genre = document.getElementById("editGenre").value;
    movie.rating = currentEditRating;

    saveMovies();
    renderMovies();
    closeEditModal();
}

// ======= Sorting & Filtering =======
document.getElementById("sortByTitle").addEventListener("click", () => {
    movies.sort((a, b) => a.title.localeCompare(b.title));
    renderMovies();
});

document.getElementById("sortByRating").addEventListener("click", () => {
    movies.sort((a, b) => b.rating - a.rating);
    renderMovies();
});

document.getElementById("filterGenre").addEventListener("change", function () {
    const genre = this.value;
    if (!genre) {
        renderMovies();
    } else {
        const filtered = movies.filter(m => m.genre === genre);
        renderMovies(filtered);
    }
});
