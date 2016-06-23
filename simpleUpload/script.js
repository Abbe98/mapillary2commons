$(document).ready(function() {
    // load filename from url
    var urlFilename = getURLParameter('mapillary');
    if (urlFilename) {
        $('#mapillary').val(urlFilename);
        processFilename();  // lookup directly if filename
    }
    // responsive buttons
    $('.btn').hover(
        function() {
            if (!$(this).prop("disabled")) {
                $(this).addClass('active');
            }
        },
        function() {
            $(this).removeClass('active');
        }
    );
    // on enter or clicking button, look up info on Mapillary
    $('#mapillary').keypress(function(e) {
        if(e.which == 13) {
            processFilename();
        }
    });
    $('#button').click(function() {
        processFilename();
    });

});

// Validate filename and request info from Commons
function processFilename() {
    // reset later fields
    $('#reflect').empty();
    $('#button').prop('disabled', true);
    $('#thumbDiv').addClass('hidden');
    $('#mapillary').removeClass('highlighted');

    // test filename
    var run = true;
    var input = $('#mapillary').val();
    if (input === ''){
        $('#mapillary').addClass('highlighted');
        run = false;
    }
    else if ( input.match(/\/\/www.mapillary.com\/map\/im\//gi) ) {
        input = decodeURIComponent(input.split('/im/')[1]);
        $('#mapillary').val(input);
    }
    // run if mapillary_id is likely to be valid
    if (run) {
        $('#pre_info').addClass('hidden');
        queryMapillary(input);
        $('#button').prop('disabled', false);
    }
    else {
        $('#button').prop('disabled', false);
    }
}

// query mapillary and process response
function queryMapillary(file_key) {
    var url = 'https://a.mapillary.com/v2/im/' +
              file_key +
              "?client_id=NzNRM2otQkR2SHJzaXJmNmdQWVQ0dzoxNjQ3MDY4ZTUxY2QzNGI2";

    $.ajax({
        url: url,
        dataType: 'json',
        success: function (data) {
            var parseddata = data;
            while ((parseddata.location === '') || (parseddata.location === NULL)){
                parseddata.location = prompt("Please enter a short description of the location", "");
            }

            var isoDate = new Date(parseddata.captured_at).toISOString().replace(/T/g, ' ').replace(/.000Z/g, '');
            var uploadDescription = '{{subst:Mapillary' +
                '|location=' + parseddata.location +
                '|key=' + parseddata.key +
                '|date=' + isoDate +
                '|username=' + parseddata.user +
                '|lat=' + parseddata.lat +
                '|lon=' + parseddata.lon +
                '|ca=' + parseddata.ca +
                '}}';
            var destFile = parseddata.location +
                           ' - Mapillary (' +
                           parseddata.key +
                           ').jpg';
            //request larger size
            var imageurl = 'https://d1cuyjsrcm0gby.cloudfront.net/' + parseddata.key + '/thumb-2048.jpg'
            var magnusurl = '//tools.wmflabs.org/url2commons/index.html?' +
                            'run=1&' +
                            'urls=' + imageurl.replace( /_/g , "$US$" ) + ' ' +
                            destFile + '|' +
                            encodeURIComponent(uploadDescription).replace( /_/g , "$US$" ) +
                            '&desc=$DESCRIPTOR$';
            // Ready to produce upload link
            $('#thumb').attr("src", imageurl);
            $('#submit_button').attr("href", magnusurl);
            $('#submit_button').html('<big>Upload as</big><br/>' + destFile);
            $('#thumbDiv').removeClass('hidden');
        },
        error: function (jqxhr, textStatus, errorThrown) {
            if (errorThrown === 'Not Found') {
                $('#reflect').text('Mapillary could not find any information on that id. Sure it is right?');
            } else {
                $('#reflect').text('The ajax call failed: ' + textStatus + ' : ' + errorThrown);
            }
        }
    });
}

// returns the named url parameter
function getURLParameter(param) {
    var pageURL = decodeURIComponent(window.location.search.substring(1));
    var urlVariables = pageURL.split('&');
    for (var i = 0; i < urlVariables.length; i++) {
        var parameterName = urlVariables[i].split('=');
        if (parameterName[0] == param) {
            return parameterName[1];
        }
    }
}
