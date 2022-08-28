"use strict";

const addIcon = document.querySelector(".main__forms-icon--add");
const mapBox = document.querySelector(".main__map");
const addBox = document.querySelector(".main__forms");
const addForm = document.querySelector(".main__forms--add");
const closeFormIcon = document.querySelectorAll(".form__close");
const findIcon = document.querySelector(".activator__form--find");
const findForm = document.querySelector(".main__forms--find");
const icons = document.querySelector(".main__forms-icons");
const addSubmitBtn = document.querySelector(".form__btn--add");
const findSubmitBtn = document.querySelector(".form__btn--find");
const restaurantsSection = document.querySelector(".restaurants");
const inputName = addForm.querySelector(".form__input--name");
const inputType = addForm.querySelector(".form__input--type");
const inputFood = addForm.querySelector(".form__input--food");
const inputService = addForm.querySelector(".form__input--service");
const inputPrice = addForm.querySelector(".form__input--price");
const inputImpress = addForm.querySelector(".form__input--impress");
const restaurantList = document.querySelector(".restaurants__list");

class Restaurants {
	date = new Date();
	id = (Date.now() + "").slice(-10);

	constructor(coords, name, type, food, service, price, impress) {
		this.coords = coords;
		this.name = name;
		this.type = type;
		this.food = food;
		this.service = service;
		this.price = price;
		this.impress = impress;
		this._calcAverage();
	}

	_calcAverage() {
		this.average = (
			(this.food + this.service + this.price + this.impress) /
			4
		).toFixed(2);
		return this.average;
	}
}

class App {
	#map;
	#mapZoomLevel = 14;
	#mapEvent;
	#restaurants = [];
	// #activeRestaurant;

	constructor() {
		this._getLocalStorage();
		this._getPosition();
		addForm.addEventListener("submit", this._newRestaurant.bind(this));
		restaurantList.addEventListener("click", this._moveToPopup.bind(this));
		closeFormIcon.forEach((icon) =>
			icon.addEventListener("click", this._startedLayout.bind(this))
		);
		findIcon.addEventListener("click", this._showFindForm.bind(this));
		findSubmitBtn.addEventListener("click", this._findRestaurant.bind(this));
	}

	_getPosition() {
		if (navigator.geolocation)
			navigator.geolocation.getCurrentPosition(
				this._loadMap.bind(this),
				function () {
					alert(`could not get your position`);
				}
			);
	}

	_loadMap(position) {
		const { latitude } = position.coords;
		const { longitude } = position.coords;

		const coords = [latitude, longitude];

		this.#map = L.map("map").setView(coords, this.#mapZoomLevel);

		L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(this.#map);

		this.#map.on("click", this._showAddForm.bind(this));

		this.#restaurants.forEach((restaurant) =>
			this._renderRestaurantMarker(restaurant)
		);
	}

	_showAddForm(mapE) {
		if (!findForm.classList.contains("form--hidden")) return;

		this.#mapEvent = mapE;
		addForm.classList.remove("form--hidden");
		this._changeLayout();
	}

	_showFindForm() {
		findForm.classList.remove("form--hidden");
		this._changeLayout();
	}

	_changeLayout() {
		mapBox.style.height = "45%";
		addBox.style.height = "35%";
		icons.classList.add("hidden");
		inputName.focus();
	}

	_startedLayout() {
		this._clearForms(addForm);
		this._clearForms(findForm);
		mapBox.style.height = "65%";
		addBox.style.height = "15%";
	}

	_clearForms(form) {
		icons.classList.remove("hidden");
		form.classList.add("form--hidden");
		form.classList.add("form--hidden");
		form.querySelector(".form__input--name").value = "";
		inputType.value = "cafe";

		if (form === addForm) {
			//prettier-ignore
			form.querySelector(".form__input--type").value = form.querySelector(".form__input--service").value = form.querySelector(".form__input--price").value = form.querySelector(".form__input--impress").value = "1"
		}
	}

	_scrolltoList(e) {
		const listTop = restaurantsSection.offsetTop;
		window.scrollTo(0, listTop - 10);
	}

	_newRestaurant(e) {
		e.preventDefault();
		const name = inputName.value;
		const type = inputType.value;
		const food = +inputFood.value;
		const service = +inputService.value;
		const price = +inputPrice.value;
		const impress = +inputImpress.value;
		const { lat, lng } = this.#mapEvent.latlng;
		let restaurant;

		restaurant = new Restaurants(
			[lat, lng],
			name,
			type,
			food,
			service,
			price,
			impress
		);

		this.#restaurants.push(restaurant);

		this._renderRestaurantPopup(restaurant);

		this._startedLayout();

		setTimeout(this._scrolltoList, 1500);

		this._renderRestaurant(restaurant);

		this._setLocalStorage();
	}

	_renderRestaurantMarker(restaurant) {
		L.marker(restaurant.coords)
			.addTo(this.#map)
			.bindPopup(
				L.popup({
					maxWidth: 250,
					minWidth: 100,
					autoClose: true,
					closeOnClick: false,
					className: `${
						restaurant.average >= 7 ? "highscore" : "lowscore"
					}-popup`,
				})
			)
			.setPopupContent(`<b>${restaurant.name}</b> ${restaurant.average}`);
	}

	_renderRestaurantPopup(restaurant) {
		L.marker(restaurant.coords)
			.addTo(this.#map)
			.bindPopup(
				L.popup({
					maxWidth: 250,
					minWidth: 100,
					autoClose: true,
					closeOnClick: true,
					className: `${
						restaurant.average >= 7 ? "highscore" : "lowscore"
					}-popup`,
				})
			)
			.setPopupContent(`<b>${restaurant.name}</b> ${restaurant.average}`)
			.openPopup();
	}

	_renderRestaurant(restaurant) {
		let html = `
		<li class="restaurant restaurant-${
			restaurant.average >= 6 ? "heighscore" : "lowscore"
		}" data-id="${restaurant.id}" data-rname="${restaurant.name}" >
			<div class="restaurant__header">
				<h3 class="restaurant__header-title">${restaurant.name}</h3>
				<p class="restaurant__header-average">${restaurant.average >= 7 ? "" : ""} ${
			restaurant.average
		}</p>
			</div>
			<div class="restaurant__scoores">
				<p class="restaurant__icon--eat">🍔 = ${restaurant.food}</p>
				<p class="restaurant__icon--service">🍽 = ${restaurant.service}</p>
				<p class="restaurant__icon--price">💸 = ${restaurant.price}</p>
				<p class="restaurant__icon--impress">❤️ = ${restaurant.impress}</p>
			</div>
		</li>
		`;

		restaurantList.insertAdjacentHTML("afterbegin", html);
	}

	_moveToPopup(e) {
		const restaurantListEl = e.target.closest(".restaurant");

		if (!restaurantListEl) return;

		const listElSibilings = restaurantListEl
			.closest(".restaurants__list")
			.querySelectorAll(".restaurant");

		const restaurant = this.#restaurants.find(
			(rest) => rest.id === restaurantListEl.dataset.id
		);

		this._renderRestaurantPopup(restaurant);

		this.#map.setView(restaurant.coords, this.#mapZoomLevel, {
			animate: true,
			pan: { duration: 1 },
		});

		listElSibilings.forEach((el) => el.classList.remove("restaurant--active"));
		restaurantListEl.classList.add("restaurant--active");
	}

	_findRestaurant(e) {
		e.preventDefault();

		const restaurantName = findForm.querySelector(".form__input--name").value;

		const restaurants = restaurantList.querySelectorAll(".restaurant");

		restaurants.forEach((restaurant) =>
			restaurant.dataset.rname === restaurantName
				? restaurant.classList.add("restaurant--active")
				: restaurant.classList.remove("restaurant--active")
		);

		const restaurant = this.#restaurants.find(
			(rest) => rest.name === restaurantName
		);

		this._renderRestaurantPopup(restaurant);

		this.#map.setView(restaurant.coords, this.#mapZoomLevel, {
			animate: true,
			pan: { duration: 1 },
		});

		this._startedLayout();
	}

	_setLocalStorage() {
		localStorage.setItem("restaurants", JSON.stringify(this.#restaurants));
	}

	_getLocalStorage() {
		const data = JSON.parse(localStorage.getItem("restaurants"));

		if (!data) return;

		this.#restaurants = data;
		this.#restaurants.forEach((restaurant) =>
			this._renderRestaurant(restaurant)
		);
	}

	reset() {
		localStorage.removeItem("restaurants");
		location.reload();
	}
}

const Application = new App();
