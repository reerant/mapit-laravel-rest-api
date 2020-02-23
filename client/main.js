//google map
let map;
let newMarker = null;
let googleMarkersArray = [];
let showingSearchedMarker = false;
let existingMarkerWindow = false;
const API_URL = "http://localhost:8000/api/marker";

function initMap() {
  //map options, center to Helsinki by default lat + lng
  let options = {
    zoom: 11,
    center: { lat: 60.192059, lng: 24.945831 }
  };
  map = new google.maps.Map(document.getElementById("map"), options);
  //get markers from DB and call another function showExistingMarker to draw the markers on the map
  getMarkersToMap();
  //new markers can be added by clicking anywhere on the map
  google.maps.event.addListener(map, "click", function(event) {
    //if newMarker and existingMarkerWindow = false, user doesn't have any other infowindows open at that time
    //--> prevents user to click open multiple windows at the same time, so data won't get mixed in DB
    if (!newMarker && !existingMarkerWindow) {
      addNewMarker(map, event.latLng.lat(), event.latLng.lng());
    }
  });
}

//get all markers to map from DB
function getMarkersToMap() {
  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
      let markers = data.data;
      for (let index = 0; index < markers.length; index++) {
        //loop all markers and create marker object on every index as long as there are markers left
        const markerObj = markers[index];
        showExistingMarker(map, markerObj);
      }
    });
}
//get specific marker to map by markerId
function getMarkerToMap(markerId) {
  fetch(API_URL + "/" + markerId)
    .then(response => response.json())
    .then(data => {
      let marker = data.data;
      showExistingMarker(map, marker);
    });
}

function showExistingMarker(map, existingMarker) {
  let marker = new google.maps.Marker({
    position: {
      lat: Number(existingMarker.lat),
      lng: Number(existingMarker.lng)
    },
    map: map,
    //add own attribute to google maps marker so that every marker icon on the map can be indentified
    markerId: existingMarker.id
  });
  //show the info of marker from db: title, description (also lat and lng)
  //infowindow has buttons for updating info, deleting marker and closing the window
  marker.infoWindow = new google.maps.InfoWindow({
    content: `
    <form>
        <label>Title:</label>
        <br>
        <input type="text" name="title" id="title" value="${existingMarker.inputTitle}">
        <br><br>
        <label>Description:</label>
        <br>
        <textarea type="text" name="description" id="description" cols="40" rows="5">${existingMarker.inputDescription}</textarea><br><br>
        <button onclick="updateExistingMarker(${existingMarker.id})" type="button">Update</button>
        <button onclick="deleteExistingMarker(${existingMarker.id})" type="button">Delete</button>
        <button onclick="cancelExistingMarker(${existingMarker.id})" id="cancelBtn" type="button">Cancel</button>
    </form>
    <br> 
    <div> 
        Latitude: ${existingMarker.lat}<br>
        Longitude: ${existingMarker.lng}
    </div>`
  });
  //existing markers' infowindows can be clicked open
  //if newMarker and existingMarkerWindow = false, user doesn't have any other infowindows open at that time
  //--> prevent user to click open multiple windows at the same time, so that data won't get mixed in DB
  google.maps.event.addListener(marker, "click", function(event) {
    if (!newMarker && !existingMarkerWindow) {
      marker.infoWindow.open(map, marker);
      existingMarkerWindow = true;
    }
  });
  //keep track of marker icons showing on the map
  googleMarkersArray.push(marker);

  //if infowindow's upper corner x gets clicked, map "updates" and shows everything correctly
  // --> there was a problem with the marker icon showing wrongly etc. without doing this
  google.maps.event.addListener(marker.infoWindow, "closeclick", function() {
    existingMarkerWindow = false;
    //current marker gets removed from map and googleMarkersArray
    marker.setMap(null);
    googleMarkersArray = googleMarkersArray.filter(
      m => m.markerId !== existingMarker.id
    );
    //get current marker again to the map
    getMarkerToMap(existingMarker.id);
  });
}

function addNewMarker(map, lat, lng) {
  let marker = new google.maps.Marker({
    position: { lat, lng },
    map: map
  });
  //user can type in info for new marker: title, description
  //infowindow has buttons for saving info and closing the window
  marker.infoWindow = new google.maps.InfoWindow({
    content: `
    <form>
        <label>Title:</label>
        <br> 
        <input type="text" name="title" id="title">
        <br><br>
        <label>Description:</label>
        <br>
        <textarea type="text" name="description" id="description" cols="40" rows="5"></textarea><br><br>
        <button onclick="storeMarker( ${lat}, ${lng})" type="button">Save</button>
        <button onclick="cancelNewMarker()" id="cancelBtn" type="button">Cancel</button>
    </form>
    <br> 
    <div> 
        Latitude: ${lat}<br>
        Longitude: ${lng}
    </div>`
  });

  //if infowindow's upper corner x gets clicked (without saved info), this removes the marker and sets newMarker to null
  //so that user can click the map again to add new marker
  //this prevents the issue of marker icon showing wrongly etc.
  google.maps.event.addListener(marker.infoWindow, "closeclick", function() {
    newMarker.setMap(null);
    newMarker = null;
  });

  marker.infoWindow.open(map, marker);
  newMarker = marker;
  //keep track of marker icons showing on the map
  googleMarkersArray.push(marker);
}

// user clicks save button
function storeMarker(lat, lng) {
  let inputTitle = document.getElementById("title").value;
  let inputDescription = document.getElementById("description").value;
  //strip tags from input text that goes to DB
  let StrippedInputTitle = inputTitle.replace(/(<([^>]+)>)/gi, "");
  let StrippedInputDescription = inputDescription.replace(/(<([^>]+)>)/gi, "");

  fetch(API_URL, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json"
    },
    method: "POST",
    body: JSON.stringify({
      inputTitle: StrippedInputTitle,
      inputDescription: StrippedInputDescription,
      lat: lat,
      lng: lng
    })
  })
    .then(response => response.json())
    .then(data => {
      // user cannot add new place to the map with empty title or description
      if (data.errors) {
        alert(
          data.message +
            "\nPlease check that you have given both title and description information before saving a new place."
        );
        newMarker.setMap(null);
        newMarker = null;
      } else {
        showExistingMarker(map, data.data);
        newMarker.setMap(null);
        newMarker = null;
        googleMarkersArray = googleMarkersArray.filter(
          m => m.markerId !== undefined
        );
      }
    });
  newMarker.infoWindow.close();
}

//user deletes a marker
function deleteExistingMarker(markerId) {
  //delete from DB
  fetch(API_URL + "/" + markerId, {
    method: "DELETE"
  });

  //remove marker icon from the map view and googleMarkersArray
  var marker = googleMarkersArray.find(m => m.markerId === markerId);
  marker.infoWindow.close();
  marker.setMap(null);
  existingMarkerWindow = false;
  googleMarkersArray = googleMarkersArray.filter(m => m.markerId !== markerId);
}

//remove the new marker icon from the map (if no data is saved) when cancel button is clicked
function cancelNewMarker() {
  newMarker.setMap(null);
  newMarker = null;
}

//user updates marker's info data in DB
function updateExistingMarker(markerId) {
  let inputTitle = document.getElementById("title").value;
  let inputDescription = document.getElementById("description").value;
  //strip tags from updated input text that goes to DB
  let StrippedInputTitle = inputTitle.replace(/(<([^>]+)>)/gi, "");
  let StrippedInputDescription = inputDescription.replace(/(<([^>]+)>)/gi, "");

  fetch(API_URL + "/" + markerId, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
    method: "PUT",
    body: JSON.stringify({
      inputTitle: StrippedInputTitle,
      inputDescription: StrippedInputDescription
    })
  });
  //close the infowindow when update button gets clicked
  existingMarkerWindow = false;
  var marker = googleMarkersArray.find(m => m.markerId === markerId);
  marker.infoWindow.close();
}

//close the infowindow for existing marker that has been clicked open
function cancelExistingMarker(markerId) {
  var marker = googleMarkersArray.find(m => m.markerId === markerId);
  existingMarkerWindow = false;
  marker.setMap(null);
  marker.infoWindow.close();
  googleMarkersArray = googleMarkersArray.filter(m => m.markerId !== markerId);
  getMarkerToMap(markerId);
}

function searchPlaces() {
  //clear filterTitles listing
  let ul = document.getElementById("myUL");
  ul.innerHTML = "";
  let foundMatch = false;
  //get query from search bar
  let query = document.getElementById("searchPlaces").value;
  //clear search bar
  document.getElementById("searchPlaces").value = "";

  fetch(API_URL)
    .then(response => response.json())
    .then(data => {
      let allMarkers = data.data;
      if (allMarkers.length !== 0) {
        for (let index = 0; index < allMarkers.length; index++) {
          const markerObj = allMarkers[index];
          //find the matching title for query
          // set everything to lower case so it's not case sensitive
          let toLowCaseQuery = query.toLowerCase();
          let toLowCaseTitle = markerObj.inputTitle.toLowerCase();
          if (toLowCaseQuery == toLowCaseTitle) {
            foundMatch = true;
            searchedMarker = markerObj;
            break;
          }
        }
        if (foundMatch) {
          //open the info window for the right marker
          var m = googleMarkersArray.find(
            m => m.markerId === searchedMarker.id
          );
          m.infoWindow.open(map, m);
        } else {
          alert("Sorry no matches with: '" + query + "'");
        }
      } else {
        // if no marker/s in DB
        alert("Sorry no saved markers on the Map.");
      }
    });
}
//show little info how to use the app
function getInfo() {
  alert(
    "Start adding new places by clicking on the map." +
      " You can update information on existing place or remove the place from the map." +
      " You can also search places by the title name."
  );
}

let fetchPromises = [];

function filterTitles() {
  let i, txtValue;
  let query = document.getElementById("searchPlaces").value;
  let toUpCaseQuery = query.toUpperCase();
  let titlesFromDb = [];

  //everytime user types into search bar, fetch promise is pushed into array
  fetchPromises.push(fetch(API_URL));
  Promise.all(fetchPromises)
    //get the latest promise response from array --> doesn't show the same title more than once in the listing
    .then(response => response[response.length - 1].json())
    .then(data => {
      let ul = document.getElementById("myUL");
      ul.innerHTML = "";
      let allMarkers = data.data;
      //go through all titles from db
      if (allMarkers.length !== 0) {
        for (let index = 0; index < allMarkers.length; index++) {
          const markerObj = allMarkers[index];
          let inputTitle = markerObj.inputTitle;
          titlesFromDb.push(inputTitle);
        }
      }
      if (query !== "") {
        //create a list of titles under the search bar + ad onclick so user can choose a specific title
        for (i = 0; i < titlesFromDb.length; i++) {
          let li = document.createElement("li");
          let a = document.createElement("a");
          let title = titlesFromDb[i];
          a.innerHTML += title;
          a.onclick = function() {
            document.getElementById("searchPlaces").value = title;
            ul.innerHTML = "";
          };
          txtValue = a.textContent || a.innerText;
          //in the listing show only matching titles for the input
          if (txtValue.toUpperCase().indexOf(toUpCaseQuery) > -1) {
            ul.appendChild(li);
            li.appendChild(a);
          }
        }
      }
    });
}
//user can get their current location on the map
function findMe() {
  // try geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        var homeMarker = new google.maps.Marker({
          position: pos,
          map: map,
          icon:
            "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png"
        });
        var infoWindow = new google.maps.InfoWindow({
          content: "You are here!"
        });
        //centers map to users location and opens infowindow
        map.setCenter(pos);
        infoWindow.open(map, homeMarker);
      },
      function() {
        //user has prevented the use of geolocation
        handleLocationError(true, map.getCenter());
      }
    );
  } else {
    // user's browser doesn't support geolocation
    handleLocationError(false, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, pos) {
  //depending on the cause, showing error message on the map
  var infoWindow = new google.maps.InfoWindow({
    content: browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  });
  infoWindow.setPosition(pos);
  infoWindow.open(map);
}
