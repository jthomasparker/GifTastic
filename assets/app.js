//var btnState;
//var dataState;
var q;
var limit = 10;
var apiKey = "96q4xCDQ26HgzN3CHLgjM7oJuSUnYffu"
var topicTitle;





var topics = ["The Office", "New Girl", "It's Always Sunny in Philadelphia", "Modern Family", "Parks and Recreation", "Arrested Development"];

$(document).ready(function(){
    for(i = 0; i < topics.length; i++){
        $("<button>")
        .attr({"class": "btn btn-primary btnTopic", "dataTopic": topics[i], "btnState": "inactive"})
        .text(topics[i])
        .appendTo("#categories")
      
    }
    $(".btnTopic").on("click", function(){
        topicTitle = $(this).attr("dataTopic");
        q = topicTitle.replace(/\s/g, "");
        var state = $(this).attr("btnState");

        if(state === "inactive"){
            $(this).attr({"class": "btn btn-primary active btnTopic", "btnState": "active"});
            queryAPI()
        } else{
            
            var topicID = "#" + q
            console.log(q)
            $(".topicPanel").remove(topicID);
         //  $("div").remove('.topicPanel' & topicID)
            $(this).attr({"class": "btn btn-primary btnTopic", "btnState": "inactive"})
        }
    })

    $('body').on('click', ".gif", function(){
        var state = $(this).attr("dataState")
        if(state === "still"){
            $(this).attr('src', $(this).attr("animate-url"));
            $(this).attr('dataState', "animate");
        } else {
            $(this).attr('src', $(this).attr("still-url"));
            $(this).attr('dataState', "still")
        }
    })

    $("#add-topic").on('click', function(){
        var addTopic = $("#topic-input").val();
        $("<button>")
        .attr({"class": "btn btn-primary btnTopic", "dataTopic": addTopic, "btnState": "inactive"})
        .text(addTopic)
        .appendTo("#categories")
    })
    
})



function queryAPI(){
    var queryURL = "https://api.giphy.com/v1/gifs/search?api_key=" + apiKey + "&limit=" + limit
    queryURL += "&q=" + q
    $.ajax({
        url: queryURL,
        method: 'GET'
    }).done(function(response){
        console.log(queryURL)
        var results = response.data;
        
        var topicPanel = $('<div>').attr({'class': "panel panel-default topicPanel",'id': q})
       // var panelTitle = q
        var panelHeading = $('<div class="panel-heading">')
                            .text(topicTitle)
                            .appendTo(topicPanel)
        var panelBody = $('<div class="panel-body">')
                            .appendTo(topicPanel)

     //   var resultDiv = $("<div>");
        for(var i = 0; i < results.length; i++){
            
            var p = $("<span>").text("Rating: " + results[i].rating)
          //  var label = "Title: " + results[i].title + "  Rating: " + results[i].rating + "<br>"
            var resultImage = $("<img>");
            resultImage.attr({
                'src': results[i].images.fixed_height_still.url, 
                'dataState': "still",
                'animate-url': results[i].images.fixed_height.url,
                'still-url': results[i].images.fixed_height_still.url,
                'class': "gif"})
               
          //  p.append(resultImage)
         //   resultDiv.append(p);
         //   panelBody.prepend(resultDiv);
          // panelBody.append(label, resultImage);
         // resultImage.after(p)
     // var fullResult =   p.append(resultImage)


     //NEED TO FIGURE OUT HOW TO ADD LABELS
          panelBody.prepend(resultImage)
       

        }
      //  panelHeading.append(panelTitle)
     //   topicPanel.append(panelHeading, panelBody)
 //   
        $("#results").prepend(topicPanel);
        
    })
}




