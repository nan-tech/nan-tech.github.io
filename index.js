var tags = [];
var userAreaSpecifier = null;

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

function updateTable() {
    // Clear the tags
    tags = [];

    if ($("#clothing").is(':checked')) {
        tags.push("clothing");
    }
    if ($("#crisis").is(':checked')) {
        tags.push("crisis");
    }
    if ($("#food").is(':checked')) {
        tags.push("food");
    }
    if ($("#legal").is(':checked')) {
        tags.push("legal");
    }
    if ($("#medical").is(':checked')) {
        tags.push("medical");
    }
    if ($("#shelter").is(':checked')) {
        tags.push("shelter");
    }
    // Clear the list before we start
    $("#myTable").html("");
    // When the checkboxes are changed, update the table
    // Get the resources with the appropriate tags
    let options = {tags: tags};
    if( userAreaSpecifier !== null ) {
        options.area = userAreaSpecifier;
    }

    DLib.Resources.get(options).then((list) => {
        /// Fill the table's HTML
        if( Object.keys(list).length == 0 ) {
	    if( userAreaSpecifier !== null ) {
                $("#myTable").html("<p>No resources were found in your area. Would you like to <a id=\"SeeMoreResourcesLink\" href=\"#\">see resources outside of your area?</a></p>");
		$("#SeeMoreResourcesLink").click(() => {
		    userAreaSpecifier = null;
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
}

$(document).ready(function() {
    // Add event listener
    $(".form-check-input").change(updateTable);
    
    // Try and get the users location
    if(navigator.geolocation) {
	navigator.geolocation.getCurrentPosition( (position) => {
	    if( position.coords ) {
		// Create an area specifier at the users position, looking at places up to 25 miles away.
		// There is probably a more elegant way to choose a distance.
            	userAreaSpecifier = new DLib.Resources.AreaSpecifier( position.coords.latitude, position.coords.longitude, 40233 );
		updateTable();
	    }
	});
    }

    updateTable(); // Load all the resources to start
});
