const reference = {
  location: { type: "Point", coordinates: [25.018456, 60.228982] },
};
navigator.geolocation.getCurrentPosition(
  (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    reference.location.coordinates[1] = lat;
    reference.location.coordinates[0] = lon;
  },
  (error) => {
    console.error("Error getting location:", error);
  }
);

const map = L.map("map").setView(
  [reference.location.coordinates[1], reference.location.coordinates[0]],
  13
);

let USER_TOKEN = "";
let MAP_LOADED = false;
let userData = {};

L.tileLayer("https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

function eucleanDist(a, b) {
  const ac1 = a.location.coordinates[0];
  const ac2 = a.location.coordinates[1];

  const bc1 = b.location.coordinates[0];
  const bc2 = b.location.coordinates[1];
  const dist = Math.sqrt((bc1 - ac1) ** 2 + (bc2 - ac2) ** 2);
  return dist;
}

async function validateResponse(response) {
  const json = await response.json();

  if (response.ok) {
    return json;
  } else if (json.message) {
    return json;
  } else {
    return { error: "fucked response, not my fault" };
  }
}

async function postData(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return validateResponse(response);
}

async function postDataWithToken(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${USER_TOKEN}`,
    },
    body: JSON.stringify(data),
  });
  return validateResponse(response);
}

async function putDataWithToken(url, data) {
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${USER_TOKEN}`,
    },
    body: JSON.stringify(data),
  });
  return validateResponse(response);
}

async function getData(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return validateResponse(response);
}

function swapToLoggedInButtons() {
  const buttons = document.getElementById("top-corner-buttons");
  buttons.innerHTML = "";

  const dropdown = document.createElement("div");
  dropdown.classList.add("dropdown");

  const userButton = document.createElement("button");
  userButton.textContent = userData.username;
  userButton.classList.add("chip", "active");
  dropdown.appendChild(userButton);

  const menu = document.createElement("div");
  menu.classList.add("dropdown-menu");
  menu.style.display = "none";

  const profileItem = document.createElement("div");
  profileItem.textContent = "Profile";
  profileItem.classList.add("dropdown-item");
  menu.appendChild(profileItem);

  const settingsItem = document.createElement("div");
  settingsItem.textContent = "Settings";
  settingsItem.classList.add("dropdown-item");
  menu.appendChild(settingsItem);

  const logoutItem = document.createElement("div");
  logoutItem.textContent = "Logout";
  logoutItem.classList.add("dropdown-item");
  logoutItem.addEventListener("click", () => {
    console.log("Logging out...");
  });
  menu.appendChild(logoutItem);

  dropdown.appendChild(menu);
  buttons.appendChild(dropdown);

  userButton.addEventListener("click", () => {
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      menu.style.display = "none";
    }
  });
}

function openRegisterWindow() {
  const dialog = document.getElementsByTagName("dialog")[0];
  dialog.innerHTML = "";

  const heading = document.createElement("h4");
  heading.textContent = "Kirjaudu";
  dialog.appendChild(heading);

  const form = document.createElement("form");
  form.action = "https://media2.edu.metropolia.fi/restaurant/api/v1/users";
  form.method = "POST";

  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.name = "username";
  usernameInput.placeholder = "Username";
  usernameInput.required = true;
  form.appendChild(usernameInput);

  const emailInput = document.createElement("input");
  emailInput.type = "text";
  emailInput.name = "email";
  emailInput.placeholder = "email";
  emailInput.required = true;
  form.appendChild(emailInput);

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.name = "password";
  passwordInput.placeholder = "Password";
  passwordInput.required = true;
  form.appendChild(passwordInput);

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.id = "confirm-login";
  submitButton.textContent = "Kirjaudu";
  form.appendChild(submitButton);

  const errorHolder = document.createElement("div");
  errorHolder.className = "error-text-holder";
  form.appendChild(errorHolder);

  dialog.appendChild(form);

  submitButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;
    const email = emailInput.value;
    const user = {
      username: username,
      password: password,
      email: email,
    };
    const response = await postData(form.action, user);
    const result = document.createElement("p");
    errorHolder.innerHTML = "";
    console.log(response);
    result.textContent = response.message;
    errorHolder.appendChild(result);
  });
  dialog.showModal();
}

function openLoginWindow() {
  const dialog = document.getElementsByTagName("dialog")[0];
  dialog.innerHTML = "";

  const heading = document.createElement("h4");
  heading.textContent = "Kirjaudu";
  dialog.appendChild(heading);

  const form = document.createElement("form");
  form.action = "https://media2.edu.metropolia.fi/restaurant/api/v1/auth/login";
  form.method = "POST";

  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.name = "username";
  usernameInput.placeholder = "Username";
  usernameInput.required = true;
  form.appendChild(usernameInput);

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.name = "password";
  passwordInput.placeholder = "Password";
  passwordInput.required = true;
  form.appendChild(passwordInput);

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.id = "confirm-login";
  submitButton.textContent = "Kirjaudu";
  form.appendChild(submitButton);

  const errorHolder = document.createElement("div");
  errorHolder.className = "error-text-holder";
  form.appendChild(errorHolder);

  dialog.appendChild(form);
  submitButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;
    const user = {
      username: username,
      password: password,
    };
    const response = await postData(form.action, user);
    const result = document.createElement("p");
    errorHolder.innerHTML = "";
    result.textContent = response.message;
    errorHolder.appendChild(result);
    if (!response.error) {
      USER_TOKEN = response.token;
      userData = { ...response.data };
      console.log(userData);
      console.log(USER_TOKEN);
      swapToLoggedInButtons();
      dialog.close();
    }
  });
  dialog.showModal();
}

function loadFilters(filters) {
  const filtersSection = document.getElementsByClassName("filters")[0];
  const cityFilter = filtersSection.getElementsByClassName("city-filter")[0];
  const providerFilter =
    filtersSection.getElementsByClassName("provider-filter")[0];

  const selectedCity = cityFilter.value;
  const selectedProvider = providerFilter.value;

  if (cityFilter.childNodes.length == 0) {
    filters.city.forEach((c) => {
      const option = document.createElement("option");
      option.textContent = c;
      option.value = c;
      if (c === selectedCity) option.selected = true;
      cityFilter.appendChild(option);
    });
  }
  console.log(providerFilter.childNodes.length);

  if (providerFilter.childNodes.length == 0) {
    filters.provider.forEach((p) => {
      const option = document.createElement("option");
      option.textContent = p;
      option.value = p;
      if (p === selectedProvider) option.selected = true;
      providerFilter.appendChild(option);
    });
  }
}

async function loadRestaurants(filters) {
  console.log(filters);
  const menuGrid = document.getElementsByClassName("menu-grid")[0];
  menuGrid.innerHTML = "";
  const restaurants = await getData(
    "https://media2.edu.metropolia.fi/restaurant/api/v1/restaurants"
  );
  let filteredRestaurants = restaurants;
  if (filters) {
    if (filters.city) {
      filteredRestaurants = filteredRestaurants.filter(
        (r) => r.city == filters.city
      );
    }
    if (filters.provider) {
      filteredRestaurants = filteredRestaurants.filter(
        (r) => r.company == filters.provider
      );
    }
    if (filters.name) {
      filteredRestaurants = filteredRestaurants.filter((r) =>
        r.name.toLowerCase().includes(filters.name)
      );
    }
  }

  filteredRestaurants.sort(
    (a, b) => eucleanDist(reference, a) - eucleanDist(reference, b)
  );

  restaurants[0] = {...restaurants[0], closest: true};

  console.log(filteredRestaurants);
  const cities = new Set().add("Kaikki");
  const providers = new Set().add("Kaikki");
  filteredRestaurants.forEach((element) => {
    cities.add(element.city);
    providers.add(element.company);
    menuGrid.appendChild(generateRestaurantCard(element));
    if (!MAP_LOADED) {
      var marker = L.marker([
        element.location.coordinates[1],
        element.location.coordinates[0],
      ]).addTo(map);
      marker.bindPopup(element.name);
    }
  });
  if (!MAP_LOADED) {
    const redIcon = L.icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      iconSize: [25, 41],
      shadowSize: [41, 41],
    });

    const youMarker = L.marker(
      [reference.location.coordinates[1], reference.location.coordinates[0]],
      { icon: redIcon }
    )
      .addTo(map)
      .bindPopup("You");
  }
  loadFilters({ city: cities, provider: providers });
  MAP_LOADED = true;
  console.log(cities);
  console.log(providers);
}

function generateRestaurantCard(restaurant) {
  const card = document.createElement("div");
  card.className = "card";
  if(restaurant.closest){
    card.classList.add("closest");
    const closestText = document.createElement("p");
    closestText.textContent = "Lähin";
    card.appendChild(closestText);
  }

  const title = document.createElement("h3");
  title.textContent = restaurant.name;
  card.appendChild(title);

  const location = document.createElement("p");
  location.textContent = restaurant.city + " — " + restaurant.company;
  card.appendChild(location);

  const hours = document.createElement("div");
  hours.className = "price";

  const showDayBtn = document.createElement("button");
  showDayBtn.className = "btn";
  showDayBtn.textContent = "Näytä päivän lista";
  card.appendChild(showDayBtn);

  const showWeekBtn = document.createElement("button");
  showWeekBtn.className = "btn";
  showWeekBtn.textContent = "Näytä viikon lista";
  card.appendChild(showWeekBtn);

  const favoriteBtn = document.createElement("button");
  favoriteBtn.className = "btn";
  favoriteBtn.textContent = "Lisää suosikiksi";
  favoriteBtn.addEventListener("click", async (event) => {
    const data = {
      favouriteRestaurant: restaurant._id,
    };
    console.log(data);
    const resp = await putDataWithToken(
      "https://media2.edu.metropolia.fi/restaurant/api/v1/users",
      data
    );
    userData = { ...resp.data };
    console.log(userData);
  });
  card.appendChild(favoriteBtn);

  return card;
}

function filterRestaurants() {
  const filtersSection = document.getElementsByClassName("filters")[0];
  const cityFilter = filtersSection.getElementsByClassName("city-filter")[0];
  const providerFilter =
    filtersSection.getElementsByClassName("provider-filter")[0];
  const search = document.getElementsByClassName("search")[0].firstElementChild;
  console.dir(search);
  loadRestaurants({
    city:
      cityFilter.value && cityFilter.value != "Kaikki"
        ? cityFilter.value
        : undefined,
    provider:
      providerFilter.value && providerFilter.value != "Kaikki"
        ? providerFilter.value
        : undefined,
    name:
      search.value && search.value != "Etsi ravintoloita..."
        ? search.value.toLowerCase()
        : undefined,
  });
}

loadRestaurants();
