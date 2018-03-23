// TODO: sticky header, clear all shows button, ability to save favorite gifs
// reduce redundancy (ie checking the button state on 2 different click events could possibly be combined into one function)

var q;
var limit = 10;
var apiKey = "96q4xCDQ26HgzN3CHLgjM7oJuSUnYffu"
var topicTitle;
var header = $("#header")
var sticky = header.offsetTop;
var colorSwitch = false;
var topics = ["The Office", "New Girl", "It's Always Sunny in Philadelphia", "Modern Family", "Parks and Recreation", "Arrested Development"];
var favorites = [];
var firstAdd = false;
var showFavs = false;


$(document).ready(function(){
    // checks local storage for our topics array
    if(localStorage["storedTopics"]){
        // if it's there, retrieve it
        var localData = localStorage.getItem("storedTopics");
        topics = JSON.parse(localData)
    } else {
        // if it's not there, send the topics array to localstorage
        updateLocalStorage("storedTopics", topics)
    }

    if(localStorage["storedFavorites"]){
        var localData = localStorage.getItem("storedFavorites");
        favorites = JSON.parse(localData)
    } else {
        updateLocalStorage("storedFavorites", favorites)
    }
    if(favorites.length > 0){
        showFavs = true
        firstAdd = true
    }

    toggleFavPanel();

    // loads topic buttons
    loadTopics();

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

    // favorite button click event
    $('body').on('click', '.btnFavorite', function(){
        var thisBtn = $(this);
        addToFav(thisBtn)
        
    })

    $('body').on('click', '.toggle-favs', function(){
        if($(this).attr('id') === 'show-favs'){
        showFavs = true;
        }else{
            showFavs = false;
        }
        toggleFavPanel();
    })

    $('body').on('click', '.btnRemove', function(){
           var Id = $(this).attr("id")
           Id = Id.substr(3)
            var btn = $('#' + Id)
            console.log(btn.length)
            if(btn.length > 0){
                alert("here")
                addToFav(btn)
            
            } else {
                alert('there')
                var idx = favorites.indexOf(Id)
                favorites.splice(idx, 1)
              //  addToFav(btn)
                updateLocalStorage("storedFavorites", favorites)
                processFavorites()
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

// updates the local storage with the topics array
function updateLocalStorage(key, value){
    if(localStorage[key]){
        localStorage.removeItem(key);
    }
        localStorage.setItem(key, JSON.stringify(value));  
}
    


// adds a topic button and saves it to the topics array
function addTopic(){

    // get the textbox value
    var topicToAdd = $("#topic-input").val().trim();
    
    // if the textbox isn't empty, add a new btnTopic button
    if(topicToAdd.length > 0){
        $("<button>")
        .attr({"class": "btn btn-primary btnTopic", "dataTopic": topicToAdd, "btnState": "inactive"})
        .text(topicToAdd)
        .appendTo("#categories")
        
        //update topics array
        topics.push(topicToAdd)

        //update local storage with the topics array
        updateLocalStorage("storedTopics", topics)

        // clean up
        $("#topic-input").val("")
    }
}


// handles the click event for a topic button
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
 
     

// queries the API
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
        console.log(results)
        
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
                panelHeading.css({
                    'background': '#a63a50',
                    'border-color': '#a63a50'
                    })
                colorSwitch = false;
            } else {
                colorSwitch = true;
            }

        // glyph to show collapsed/not collapsed
        var glyphSpan = $('<span>')
                        .html("<p>")
                        .appendTo(panelHeading)

        var glyph = $('<i class="glyphicon glyphicon-chevron-up">')
                    .appendTo(glyphSpan)
        

        // create a div to wrap the panel body to make it collapsible, append it to the panel
        var collapseDiv = $('<div class="panel-collapse collapse in">')
                        .attr('id', "collapse-" + q)
                        .appendTo(topicPanel)
                        // change glyph based on whether or not the panel is collapsed
                        .on('shown.bs.collapse', function() {
                            glyph.addClass('glyphicon-chevron-up').removeClass('glyphicon-chevron-down')})
                        .on('hidden.bs.collapse', function() {
                            glyph.addClass('glyphicon-chevron-down').removeClass('glyphicon-chevron-up')});

        // create panel body, append it to the collapse div
        var panelBody = $('<div class="panel-body">')
                        .appendTo(collapseDiv)

        // loop through the results and get what we need
        for(var i = 0; i < results.length; i++){
            var gifID = results[i].id
            // label for the gif (Rating for now, may add title later)
            var labelDiv = $('<div>')
          // var label = $('<span>').html("<b>Rating: " + results[i].rating.toUpperCase() + "</b>");
          var label = "<b> Rating: " + results[i].rating.toUpperCase() + "</b>"
         //  var favStar = $('<span class="glyphicon glyphicon-star">')
            var btnFavorite = $('<button class="btn btn-default btnFavorite">')
                            .attr('id', gifID)
            
                            

                          labelDiv.html(label)  
            updateFavBtn(btnFavorite) 
            labelDiv.prepend(btnFavorite) 
         // label.prepend(btnFavorite)
          

            // create the img element for the gif
            var resultImage = $("<img>");

            // assign attributes to the img from the results
            resultImage.attr({
                'src': results[i].images.fixed_height_still.url, 
                'dataState': "still",
                'animate-url': results[i].images.fixed_height.url,
                'still-url': results[i].images.fixed_height_still.url,
                'class': "gif",
                'alt': results[i].title,
                'id': "#gif-" + gifID
                });
            
            // create a div for each gif with the label and gif
          //  label.prepend(btnFavorite)
           // label.append(resultImage)
            
            var resultDiv = $('<div class="resultDiv">')
                        .append(labelDiv, resultImage)
                       // .append(resultImage)

            // add the result div to the panel body
            panelBody.prepend(resultDiv)
        }

        // prepend the panel to #results
        $("#results").prepend(topicPanel);
    })
}



function processFavorites(){
    $('#favBody').empty();
      if(showFavs && favorites.length > 0){  
        var queryURL = "https://api.giphy.com/v1/gifs?api_key=" + apiKey + "&ids=" + favorites
        $.ajax({
            url: queryURL,
            method: 'GET'
        }).done(function(response){
            var results = response.data
            
            for(i=0; i < results.length; i++){
                // create the img element for the gif
                var resultImage = $("<img>");

                // assign attributes to the img from the results
                resultImage.attr({
                    'src': results[i].images.fixed_height_still.url, 
                    'dataState': "still",
                    'animate-url': results[i].images.fixed_height.url,
                    'still-url': results[i].images.fixed_height_still.url,
                    'class': "gif",
                    'alt': results[i].title,
                    'id': "#fav-" + results[i].id
                });

                var Id = 'rmv' + results[i].id
                var resultDiv = $('<div class="resultDiv">')
                var favRemove = $('<span class="glyphicon glyphicon-remove">')
                var btnRemove = $('<button class="btn btn-default btnRemove">')
                                .attr("id", Id)
                                    
                

                btnRemove.append(favRemove)
                
                
               resultDiv.append(btnRemove, resultImage)
                $('#favBody').prepend(resultDiv)
            }   
        })
    }
}


function updateFavBtn(thisBtn){
    thisBtn.empty();
    var Id = $(thisBtn).attr("id");
    var btnState = $(thisBtn).attr("btnState")
    var favStar = $('<span class="glyphicon">')
    if(favorites.indexOf(Id) < 0){
        $(thisBtn).attr("btnState", "inactive")
        favStar.removeClass("glyphicon-star").addClass("glyphicon-star-empty")
       
    } else {
        $(thisBtn).attr("btnState", "active")
        favStar.removeClass("glyphicon-star-empty").addClass("glyphicon-star")
        
    }
    $(thisBtn).append(favStar)
    }



function addToFav(thisBtn){
    var btnID = $(thisBtn).attr("id")
    var favStar = $('<span class="glyphicon glyphicon-star">')
        if(favorites.indexOf(btnID) < 0){
            $(thisBtn).attr("btnState", "active")
            favorites.push(btnID)
        } else {
            $(thisBtn).attr("btnState", "inactive")
            var idx = favorites.indexOf(btnID)
            favorites.splice(idx, 1)
        }
        // add this to remove
        var favCount = favorites.length;
        $('#show-favs')
        .html(" (" + favCount + ")")
        .prepend(favStar)
        updateFavBtn(thisBtn)
      //  toggleFavPanel()
        updateLocalStorage("storedFavorites", favorites)
        processFavorites()
        if(favCount === 0){
            showFavs = false;
            toggleFavPanel()
        }
        if(!firstAdd){
            firstAdd = true;
            showFavs = true;
            toggleFavPanel();
        }
}

function toggleFavPanel(){
    var favCount = favorites.length;
    var favStar = $('<span class="glyphicon glyphicon-star">')
    if(showFavs && favCount > 0){
        $('#show-favs').hide()
        $('#results').addClass('col-md-8')
        $('#favorites').removeClass('col-xs-0').addClass('col-xs-12 col-md-4')
        
        var favPanel = $('<div>')
            .attr({
            'class': "panel panel-default",
            'id': "favPanel"
            })
        
        var favHeading = $('<div class="panel-heading">').appendTo(favPanel)
        var favTitle = $('<h3 class="panel-title">').html("Favorites<br>").appendTo(favHeading)
        var hideFavs = $('<button class="btn btn-default toggle-favs">')
                        .text(" Hide")
                        .attr("id", "hide-favs")
                        .appendTo(favTitle);
        
        hideFavs.prepend(favStar)
        var favBody = $('<div class="panel-body" id="favBody">').appendTo(favPanel)
        favPanel.appendTo("#favorites")
        firstAdd = true;
        processFavorites();
        } else {
            
            $('#show-favs')
        .html(" (" + favCount + ")")
        .prepend(favStar)
        .show()
            $('#favorites').empty();
            $('#results').removeClass('col-md-8')
            $('#favorites').removeClass('col-xs-12 col-md-4').addClass('col-xs-0')
        }
    }
