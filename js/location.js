(function() {

const API_KEY = "AIzaSyCWsNQAm2i_d71hTcADpkASPMraR0nOP94";
const GeoLocationAPIEndpoint = "https://www.googleapis.com/geolocation/v1/geolocate";
const ReverseGeocodingAPIEndpoint = "https://maps.googleapis.com/maps/api/geocode/json";

let UserAreaSpecifier = undefined;
let CityName = undefined;

// Get the users area using Google geolocation API
// If the users area has already been determined it will not be redetermined
// If the users area has been set to null, it will not be redetermined.
// Returns a promise with the area specifier
function getUserArea() {
  if( UserAreaSpecifier === undefined ) {
    // There is no saved location data on this user
    return new Promise( (resolve, reject) => {
      const QueryString = `key=${API_KEY}`;
      $.post(`${GeoLocationAPIEndpoint}?${QueryString}`, null, 'json')
      .done((data) => {
        if( !data || !data.location ) {
          reject();
	} else {
	  // Choosing an arbitrary distance (~25mi)
	  // There is probably a more elegant way to pick this
          UserAreaSpecifier = new DLib.Resources.AreaSpecifier(data.location.lat,
	                                                       data.location.lng,
	                                                       40233);
	  resolve( UserAreaSpecifier );
	}
      })
      .fail(() => {
        reject();
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      resolve( UserAreaSpecifier );
    });
  }
}

// Finds the user's city name
// User's lat long as part of the area specifier passed to Google places API
function getCityName() {
  if( UserAreaSpecifier === undefined ) {
    return getUserArea().then( getCityName );
  }

  return new Promise( (resolve, reject) => {
    if( CityName === undefined ) {
      let QueryString = `latlng=${UserAreaSpecifier.latitude},${UserAreaSpecifier.longitude}`;
      QueryString += `&result_type=locality`;
      QueryString += `&key=${API_KEY}`;
      $.post(`${ReverseGeocodingAPIEndpoint}?${QueryString}`, null, 'json')
        .done((data) => {
          if(data.results.length === 0) {
            reject();
	  } else {
	    CityName = data.results[0].formatted_address;
	    resolve(CityName);
	  }
        })
        .fail(() => {
          reject();
        });
    } else {
      resolve(CityName);
    }
  }); 
}

// Export public functions into window namespace
window.getUserArea = getUserArea;
window.getCityName = getCityName;
})();
