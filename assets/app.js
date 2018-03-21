//var btnState;
//var dataState;
var q;
var limit = 10;
var apiKey = "96q4xCDQ26HgzN3CHLgjM7oJuSUnYffu"
var topicTitle;
var header = $("#header")
var sticky = header.offsetTop;
var colorSwitch = false;
var storedArr = [];





var topics = ["The Office", "New Girl", "It's Always Sunny in Philadelphia", "Modern Family", "Parks and Recreation", "Arrested Development"];

$(document).ready(function(){
    // checks local storage for our topics array
    if(localStorage["storedTopics"]){
        var localData = localStorage.getItem("storedTopics");
        topics = JSON.parse(localData)
    } else {
        updateLocalStorage("storedTopics", topics)
    }

    // loads topic buttons
    loadTopics();


    window.onscroll = function(){
      //  stickyHeader();
    }

// Click Events:

    // topic button click event
    $('body').on('click', '.btnTopic', function(){
        // store the topic button that was clicked and send it to it's function
        var thisBtn = $(this)
        btnTopicClick(thisBtn);   
    })


    // gif click event for stop/start animation
    $('body').on('click', '.gif', function(){
        // get the state of the gif, change url accordingly
        var state = $(this).attr("dataState")
        if(state === "still"){
            $(this).attr('src', $(this).attr("animate-url"));
            $(this).attr('dataState', "animate");
        } else {
            $(this).attr('src', $(this).attr("still-url"));
            $(this).attr('dataState', "still")
        }
   })


   // add topic button click event
    $("#add-topic").on('click', function(){
        addTopic();
    })

    // add topic on enter
    $('#topic-input').keypress(function(e){
        var key = e.which;
        if(key === 13){
            addTopic();
        }
    })
    
    
})


// creates a button for each item in the topics array
function loadTopics(){
    for(i = 0; i < topics.length; i++){
        $("<button>")
        .attr({
            "class": "btn btn-primary btnTopic", 
            "dataTopic": topics[i], 
            "btnState": "inactive"
            })
        .text(topics[i])
        .appendTo("#categories")
    }
}

function updateLocalStorage(key, value){

   // console.log(JSON.parse(localStorage[key]).length)
    if(localStorage[key]){
        localStorage.removeItem(key);
    }
        localStorage.setItem(key, JSON.stringify(value));
    
}


function addTopic(){
    // get the textbox value
    var topicToAdd = $("#topic-input").val().trim();
    // if the textbox isn't empty, add a new btnTopic button
    if(topicToAdd.length > 0){
        $("<button>")
        .attr({"class": "btn btn-primary btnTopic", "dataTopic": topicToAdd, "btnState": "inactive"})
        .text(topicToAdd)
        .appendTo("#categories")
        topics.push(topicToAdd)
        //update local storage
        updateLocalStorage("storedTopics", topics)
        // clean up when you're done
        $("#topic-input").val("")
    }
}

function btnTopicClick(thisBtn){
     // store topic for panel titles
    topicTitle = $(thisBtn).attr("dataTopic");
    
     // store a formatted topicTitle for the query and panel ID
    q = topicTitle.replace(/\s/g, "-");
    q = q.replace(/'/g, "");
 
    // get the button state
     var state = $(thisBtn).attr("btnState");

    // if the button state is inactive, make it active and run the api query
    if(state === "inactive"){
        $(thisBtn)
        .addClass("clicked")
        .attr({"btnState": "active"})
        .prepend("&#10003; ");

        queryAPI()

    // if the button state is active, remove the panel with the matching id, inactivate button
    } else {

        // get the panel id
        var topicID = "#" + q

        // remove the panel with the matching id
        $(".topicPanel").remove(topicID);

        // update the button to its original state
        $(thisBtn)
            .removeClass("clicked")
            .blur()
            .attr('btnState', "inactive")
            .text(topicTitle);
    }
}
 
     


function queryAPI(){
    // build the url for the api call
    var queryURL = "https://api.giphy.com/v1/gifs/search?api_key=" + apiKey + "&limit=" + limit
    queryURL += "&q=" + q

    // api call
    $.ajax({
        url: queryURL,
        method: 'GET'
    }).done(function(response){

        // store the results
        var results = response.data;
        
        // create the panel that will hold the resulting gifs
        var topicPanel = $('<div>').attr({
                                    'class': "panel panel-default topicPanel",
                                    'id': q
                                    })


        // create panel header, append it to the panel
        var panelHeading = $('<div class="panel-heading">')
                            .attr({
                                'data-toggle': "collapse",
                                'href': "#collapse-" + q
                            })
                            .text(topicTitle)
                            .appendTo(topicPanel)
            
            // alternates the color of the panel headers
            if(colorSwitch){
                panelHeading.css('background', '#a63a50')
                colorSwitch = false;
            } else {
                colorSwitch = true;
            }

        // create a div to wrap the body to make it collapsible
        var collapse = $('<div class="panel-collapse collapse in">').attr("id", "collapse-" + q)
                        .appendTo(topicPanel)
        // create panel body, append it to the panel
        var panelBody = $('<div class="panel-body">')
                        .appendTo(collapse)

        // loop through the results and get what we need
        for(var i = 0; i < results.length; i++){
            // label for the gif (Rating for now, may add title later)
           var label = $('<span>').html("<b>Rating: " + results[i].rating.toUpperCase() + "</b><br>");
            // create the img element for the gif
            var resultImage = $("<img>");
            // assign attributes to the img from the results
            resultImage.attr({
                'src': results[i].images.fixed_height_still.url, 
                'dataState': "still",
                'animate-url': results[i].images.fixed_height.url,
                'still-url': results[i].images.fixed_height_still.url,
                'class': "gif",
                'alt': results[i].title
                });
            
            // create a div for each gif with the label and gif
            var resultDiv = $('<div class="resultDiv">')
                        .append(label)
                        .append(resultImage)

            // add the result div to the panel
            panelBody.prepend(resultDiv)
        }

        // add the panel to #results
        $("#results").prepend(topicPanel);
    })
}




/* function to add/remove sticky class for sticky header
Can't get it to work, will have to come back
function stickyHeader(){
    
    var header = document.getElementById("sticky-header")
    var sticky = header.offsetTop;
    console.log(header.offsetTop)
    if(window.pageYOffset >= sticky){
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
}
*/


