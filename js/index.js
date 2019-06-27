var tags = [];

// Creates HTML table rows given a list of resource objects
// The list is a mapping of Resource IDs to Resource Objects
// Returns an HTML string
function createHTMLInsert(list) {
    var html = "";
    Object.keys(list).forEach(key => {
        html += `   <div class="rowformat">
                      <div class="row">
                      <div class="col-3">${list[key].tags}</div>
                      <div class="col-3">${list[key].name}</div>
                      <div class="col-3" >${list[key].location != "" ? `<a href="#" class="address-line">${list[key].location.address}</a>`: ''}</div>
                      <div class="col-3"><div><a class ="modalClick" href="#" data-resourceID="${key}">More Information</a></div></div>
                      </div>
                      </div>`
    });
    return html;
}

// Update text on the document reflecting a users city name.
// Returns a promise
function updateUserCity() {
  // Get the users city name and apply that to the document async
  return getCityName().then( (CityName) => {
    $("#cityName").text(CityName);
  }).catch(() => {
    $("#cityName").text("Unkown");
  });
}

function updateTable() {
    // Clear the list before we start
    $("#myTable").html("");

    // When the checkboxes are changed, update the table
    // Get the resources with the appropriate tags
    let options = {};

    // If there is text in the search bar use that in the query
    const searchString = $("#searchBarInput").val();
    if( searchString !== "" ) {
      options.text = searchString; 
    }
    getUserArea().then( ( userAreaSpecifier ) => {
      // If the promise to get user area is fufilled
      // set the "area" fields of the options passed to 'get'
      options.area = userAreaSpecifier;
    })
    .catch(new Function()) // Provide no rejection handler.
                           // Not running the sucsess code handles the rejection.
    .finally( () => {

      // Query the database and populate the document 
      DLib.Resources.get(options).then((list) => {
        
        if( Object.keys(list).length == 0 ) {
          if( options.area !==  null ) {
            $("#myTable").html("<p>No resources were found in your area matching your criteria. Would you like to <a id=\"SeeMoreResourcesLink\" href=\"#\">see resources outside of your area?</a></p>");
            $("#SeeMoreResourcesLink").click(() => {
              nullifyUserArea();
	      $("#cityName").text("anywhere");
              updateTable();
            });
          } else {
            $("#myTable").html("<p>No resources were found. Try refining your search</p>");
          }
          return;
         }

         $("#myTable").html(createHTMLInsert(list));
         // Add a click listener to all of the 'more info' buttons
         $(".modalClick").click(function() {
             let resourceID = $(this).attr('data-resourceID');
             DLib.Resources.getResourceByID(resourceID).then((resource) => {
                 $(".modal-title").text(`More Information: ${resource.name}`);
                 $(".modal-loc").text(`Location: ${resource.location.address}`).append("<br><br>");;
                 resource.details().then((details) => {
                     $(".modal-desc").text(`Description: ${details.info}`).append("<br><br>");
                     $(".modal-phone").text(`Phone: ${details.contact.phone}`).append("<br><br>");;
                     $(".modal-site").html( `<a href="${details.contact.website}"> Website </a>`);
                     $('#myModal').modal('show');
                 });
             }).catch(() => {
                 console.error("There was an error retrieving more information about this resource.");
             });
         });
      });
  });
}

$(document).ready(function() {
  // Add event listener to search bar
  $("#searchBarInput").on('keypress', (event) => {
    if( event.keyCode == 13 ) {  // Keycode 13 is enter
      updateTable();
    }
  });

  updateTable();  // Load all the resources to start
  // Update the users city on the document. We dont really care when this happens
  updateUserCity();
    
});
