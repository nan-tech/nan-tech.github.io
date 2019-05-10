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

function updateTable() {
    // Clear the tags
    tags = [];

    if ($("#clothing").is(':checked')) {
        console.log("Clothing checked");
        tags.push("clothing");
    }
    if ($("#crisis").is(':checked')) {
        console.log("Crisis checked");
        tags.push("crisis");
    }
    if ($("#food").is(':checked')) {
        console.log("Food checked");
        tags.push("food");
    }
    if ($("#legal").is(':checked')) {
        console.log("Legal checked");
        tags.push("legal");
    }
    if ($("#medical").is(':checked')) {
        console.log("Medical checked");
        tags.push("medical");
    }
    if ($("#shelter").is(':checked')) {
        console.log("Shelter checked");
        tags.push("shelter");
    }
    // Clear the list before we start
    $("#myTable").html("");
    // When the checkboxes are changed, update the table
    // Get the resources with the appropriate tags
    DLib.Resources.get({tags: tags}).then((list) => {
        /// Fill the table's HTML
        if( Object.keys(list).length == 0 ) {
            $("#myTable").html("<p>No resources were found. Try refining your search</p>");
            return;
        }
        $("#myTable").html(createHTMLInsert(list));
        // Add a click listener to all of the 'more info' buttons
        $(".modalClick").click(function() {
            let resourceID = $(this).attr('data-resourceID');
            DLib.Resources.getResourceByID(resourceID).then((resource) => {
                $(".modal-title").text(`More Information: ${resource.name}`);
          //      $(".modal-body").text(`Location: ${resource.location.address}`);
                resource.details().then((details) => {
                    $(".modal-body").text(`Description: ${details.info}`);
                    $(".modal-body").text(`Phone: ${details.phone}`);
                    $('#myModal').modal('show');
                    console.log("Here's your modal");
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
    updateTable(); // Load all the resources to start
});
