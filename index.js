/*
Author: Isaias Alvarez
*/

let form = document.getElementById('search-form');
let historyList = document.getElementById('search-history');
let toptenlist = document.getElementById('top-earthquakes');

let map;
let lat;
let lng;
let activeMarkers = [];
let searchHistory = [];


function submitHandler(event){
    event.preventDefault();
    let address = document.getElementById('placeField').value
    
    // Remove previous markers
    clearActiveMarkers();

    // get coords and paint new Markers
    // on Map
    getCoords(address);
}

form.onsubmit = submitHandler


function clearActiveMarkers(){

    // Remove markers from map
    activeMarkers.forEach(marker=>{
        marker.setMap(null);
    })

    // Clear list
    activeMarkers.length = 0;
}

function initMap(){
    // Add map to page
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 25.6866142, lng: -100.3161126 },
        zoom: 0,
    });
}

window.initMap = initMap;


function getCoords(address){

    // Get coords from address 
    // pass in the form using
    // Google geocoder API
    let geocoder = new google.maps.Geocoder();

    geocoder.geocode({
        'address':address
    }, async function(results, status){

        if (status == google.maps.GeocoderStatus.OK){
            
            lat = results[0].geometry.location.lat();
            lng = results[0].geometry.location.lng();


            // Recenter map to new Coords
            map.setCenter({lat: lat, lng:lng})
            map.setZoom(8)


            // Send request to geonames
            let url = `http://api.geonames.org/earthquakesJSON?north=${lat+0.3}&south=${lat-0.3}&east=${lng+0.3}&west=${lng-0.3}&username=ongorio`
            const response = await fetch(url)
            const data = await response.json();
           

            if (data.earthquakes.length != 0){
                // If found paint new markers for each
                // earthquake record found
                data.earthquakes.forEach(record=>{
                    let marker = new google.maps.Marker({
                        position: {lat: record.lat, lng: record.lng},
                        title: `Date: ${record.datetime} Magnitud: ${record.magnitude}`
                    })
                    
                    
                    // Paint Marker
                    marker.setMap(map);
                    activeMarkers.push(marker)

                    // Add infoWindow to each Marker
                    google.maps.event.addListener(marker, 'click', ()=>{
                        let infoWindow = new google.maps.InfoWindow({
                            content: `
                            <strong>Date: </strong>${record.datetime} <br>
                            <strong>Magnitude: </strong>${record.magnitude}
                            <strong>Coords: </strong> <br>
                            <strong>Lat: </strong><em>${record.lat}</em> <strong>Lng: </strong><em>${record.lng}</em><br>
                            `
                        })
                        infoWindow.open(map, marker)
                    })
                });
            }

            addSearchTerm(address)
        }else{
            
            alert('Couldn\'t Find the place you\'re looking for! Try Again!')
        }
    })
}


function setMarkToPos(){
    clearActiveMarkers();
    lat = parseInt(this.dataset.lat);
    lng = parseInt(this.dataset.lng);

    let marker = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        title: this.innerText
    });

    marker.setMap(map);
    activeMarkers.push(marker)

    google.maps.event.addListener(marker, 'click', ()=>{
        let infoWindow = new google.maps.InfoWindow({
            content: this.innerText
        })
        infoWindow.open(map, marker)
    });

    map.setCenter({lat: lat, lng: lng})
    map.setZoom(8)
}


// Get information about previous
// Searched place
function clickedSearchedTerm(){
    document.getElementById('placeField').value = this.dataset.place
    
    // Remove previous markers
    clearActiveMarkers();

    // get coords and paint new Markers
    getCoords(this.dataset.place);
}


// Add Search History list items
function populateHistory(){
    historyList.innerHTML = null
    searchHistory.forEach(item=>{
        let li = document.createElement('li');
        li.dataset.place = item
        li.innerText = item;
        li.addEventListener('click', clickedSearchedTerm)
        historyList.appendChild(li)
    });
}


// Get search history from local Storage
// Then populate the Search history list
function loadSearchHistory(){
    searchHistory = JSON.parse(localStorage.getItem('history'));

    if (!searchHistory){
        searchHistory = [];
    }

    populateHistory();
}


// Add new search Term to the list
function addSearchTerm(term){

    let t = term.toUpperCase();


    // Check if item already on list
    let index = searchHistory.indexOf(t)
    if (index != -1){
        searchHistory.splice(index, 1);
    }


    // Remove item if the list is full
    if (searchHistory.length >= 5){
        searchHistory.pop();
    }


    // Add item to the start of the list
    // and save it to local storage
    searchHistory.unshift(t);
    localStorage.setItem('history', JSON.stringify(searchHistory));

    populateHistory();
}


// Initial check of history
loadSearchHistory();



async function getTopEartquakes(){

    // Set wait to true
    document.getElementById('top10').style.display = 'none';
    document.getElementById('loadin').style.display = 'block'

    const today = new Date()
    // Get dates to filter records
    const earlyDate = new Date()
    earlyDate.setMonth(today.getMonth() - 12);

    let url = `http://api.geonames.org/earthquakesJSON?north=44.1&south=-9.9&east=-22.4&west=55.2&date=${today.getFullYear()}-${today.getMonth()}-${today.getDay()}&minMagnitude=6&maxRows=200&username=ongorio`
    const response = await fetch(url);
    const data = await response.json();

    let records = data.earthquakes;

    // Promise for filtering the info by date and magnitude
    const filterRecords = new Promise((resolve, reject)=>{
        let r = records.filter(record=>{
            let temp = new Date(record.datetime);
    
            return earlyDate <= temp;
        });
    
        r.sort((a,b)=>{
            if (a.magnitude < b.magnitude) return 1;
            if (a.magnitude > b.magnitude) return -1;
            return 0;
    
        });

        const filteredRecords = r.slice(0,10);

        filteredRecords.forEach(record=>{
            let li = document.createElement('li');
            li.innerText = `Magnitude: ${record.magnitude} Date: ${record.datetime}`
            li.dataset.lat = record.lat;
            li.dataset.lng = record.lng;
    
            li.addEventListener('click', setMarkToPos)
            
            toptenlist.appendChild(li);
        });

        // Hide loadin tag and show data
        document.getElementById('top10').style.display = 'block';
        document.getElementById('loadin').style.display = 'none';
        resolve();

        
    })

    // Await for top ten list to
    // be created
    await filterRecords;
}

getTopEartquakes();

function clearHistory(event){
    if (event.ctrlKey && event.altKey && event.key === 'a'){
        localStorage.removeItem('history');
        loadSearchHistory();
    }
}

document.addEventListener('keyup', clearHistory, false);
