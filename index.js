let form = document.getElementById('search-form');
let historyList = document.getElementById('search-history');

let map;
let lat;
let lng;
let activeMarkers = [];
let searchHistory = [];

async function submitHandler(event){
    event.preventDefault();
    let address = document.getElementById('place').value
    
    // Remove previous markers
    clearActiveMarkers();

    // get coords and paint new Markers
    getCoords(address);

}

form.onsubmit = submitHandler


function clearActiveMarkers(){
    activeMarkers.forEach(marker=>{
        marker.setMap(null);
    })

    activeMarkers.length = 0;
}

function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 25.6866142, lng: -100.3161126 },
        zoom: 0,
    });

}

window.initMap = initMap;



function getCoords(address){

    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        'address':address
    }, async function(results, status){

        // Get coords from address 
        // pass in the form using
        // Google geocoder API
        if (status == google.maps.GeocoderStatus.OK){
            
            lat = results[0].geometry.location.lat();
            lng = results[0].geometry.location.lng();

            // console.log('Latitud',lat)
            // console.log('Longitud',lng)
            // Recenter map to new Coords
            map.setCenter({lat: lat, lng:lng})
            map.setZoom(8)

            // Sent request to geonames
            let url = `http://api.geonames.org/earthquakesJSON?north=${lat+0.3}&south=${lat-0.3}&east=${lng+0.3}&west=${lng-0.3}&username=ongorio`
            const response = await fetch(url)
            const data = await response.json();
        
            // console.log(data)
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
                });
            }

            addSearchTerm(address)
        }else{
            alert('Couldn\'t Find the place you\'re looking for! Try Again!')
        }
    })
}


function clickedSearchedTerm(){
    document.getElementById('place').value = this.dataset.place
    
    // Remove previous markers
    clearActiveMarkers();

    // get coords and paint new Markers
    getCoords(this.dataset.place);
}

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


function loadSearchHistory(){
    searchHistory = JSON.parse(localStorage.getItem('history'));

    if (searchHistory){
        populateHistory();
    }else{
        searchHistory = []
    }

}


function addSearchTerm(term){

    let t = term.toUpperCase();


    let index = searchHistory.indexOf(t)
    // console.log(index)

    if (index != -1){
        searchHistory.splice(index, 1);
    }

    if (searchHistory.length >= 5){
        searchHistory.pop();
    }

    searchHistory.unshift(t);
    localStorage.setItem('history', JSON.stringify(searchHistory));

    populateHistory();
}

loadSearchHistory();
