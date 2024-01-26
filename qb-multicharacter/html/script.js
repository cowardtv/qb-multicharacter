var selectedChar = null;
var WelcomePercentage = "30vh"
qbMultiCharacters = {}
var Loaded = false;
var NChar = null;
var EnableDeleteButton = false;
var dollar = Intl.NumberFormat('en-US');
$(document).ready(function () {
    window.addEventListener('message', function (event) {
        var data = event.data;
        if (data.action == "ui") {
            NChar = data.nChar;
            EnableDeleteButton = data.enableDeleteButton;
            if (data.toggle) {
                $('.container').show();
                $(".welcomescreen").fadeIn(150);
                qbMultiCharacters.resetAll();

                // You can remove the loading code here
                setCharactersList()
                $.post('https://qb-multicharacter/setupCharacters');
                qbMultiCharacters.fadeInDown('.characters-list', '76%', 1);
                $(".btns").css({"display":"block"});
                $.post('https://qb-multicharacter/removeBlur');
            } else {
                $('.container').fadeOut(250);
                qbMultiCharacters.resetAll();
            }
        }

        if (data.action == "setupCharacters") {
            setupCharacters(event.data.characters)
        }

        if (data.action == "setupCharInfo") {
            setupCharInfo(event.data.chardata)
        }
    });

    $('.datepicker').datepicker();
});

$('.continue-btn').click(function(e){
    e.preventDefault();
});

$('.disconnect-btn').click(function(e){
    e.preventDefault();

    $.post('https://qb-multicharacter/closeUI');
    $.post('https://qb-multicharacter/disconnectButton');
});

function setupCharInfo(cData) {
    if (cData == 'empty') {
        $('.character-info-valid').html('<span id="no-char"><br><br></span>');
    } else {
        var gender = "Man"
        if (cData.charinfo.gender == 1) { gender = "Woman" }
        $('#title-placeholder').html( cData.charinfo.firstname + ' ' + cData.charinfo.lastname);
         // Update the character info boxes
        $('.character-info-box .char-info-js').eq(0).text(cData.charinfo.birthdate);
        $('.character-info-box .char-info-js').eq(2).text(cData.job.label + ', ' + cData.job.grade.name);
        $('.character-info-box .char-info-js').eq(1).text(gender);
        $('.character-info-box .char-info-js').eq(3).text('$ ' + dollar.format(cData.money.cash));
        $('.character-info-box .char-info-js').eq(4).text('$ ' + dollar.format(cData.money.bank));
    }
}
function setupCharacters(characters) {
    $.each(characters, function(index, char){
        $('#char-'+char.cid).html("");
        $('#char-'+char.cid).data("citizenid", char.citizenid);
        setTimeout(function(){
            $('#char-'+char.cid).html('<div class="user"><span id="fa-solid fa-user">' + char.cid + '</span></div>');
            $('#char-'+char.cid).data('cData', char);
            $('#char-'+char.cid).data('cid', char.cid);
        }, 100);
    })
}

$(document).on('click', '#close-log', function(e){
    e.preventDefault();
    selectedLog = null;
    $('.welcomescreen').css("filter", "none");
    $('.server-log').css("filter", "none");
    $('.server-log-info').fadeOut(250);
    logOpen = false;
});

/* $(document).on('click', '#info-text', function(e){
    e.preventDefault();
    $(".character-info").toggle( 'fast', function(){
     });
}); */

$(document).on('click', '.character', function(e) {
    var cDataPed = $(this).data('cData');
    e.preventDefault();
    if (selectedChar === null || $(selectedChar).attr('id') !== $(this).attr('id')) {
        // If a different character is clicked or no character is selected
        $(".character-info").hide(); // Explicitly hide the info
        if (selectedChar !== null) {
            $(selectedChar).removeClass("char-selected");
        }

        selectedChar = $(this);
        if ((selectedChar).data('cid') == "") {
            $(selectedChar).addClass("char-selected");
            setupCharInfo('empty');
            $("#play-text").html('<i class="fa-solid fa-plus"></i>');
            $("#play").css({"display":"block"});
            $("#delete").css({"display":"none"});
            $.post('https://qb-multicharacter/cDataPed', JSON.stringify({
                cData: cDataPed
            }));
        } else {
            $(selectedChar).addClass("char-selected");
            setupCharInfo($(this).data('cData'));
            $(".character-info").show(); // Explicitly show the info
            $("#play-text").html('<i class="fa-solid fa-play"></i>');
            $("#delete-text").html('<i class="fa-solid fa-user-slash"></i>');
            $("#play").css({"display":"block"});
            if (EnableDeleteButton) {
                $("#delete").css({"display":"block"});
            }
            $.post('https://qb-multicharacter/cDataPed', JSON.stringify({
                cData: cDataPed
            }));
        }
    }
});


var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '': '&#x60;',
    '=': '&#x3D;'
};

function escapeHtml(string) {
    return String(string).replace(/[&<>"'=/]/g, function (s) {
        return entityMap[s];
    });
}
function hasWhiteSpace(s) {
    return /\s/g.test(s);
}

$(document).on('click', '#create', function (e) {
    e.preventDefault();

    let firstname= $.trim(escapeHtml($('#first_name').val()))
    let lastname= $.trim(escapeHtml($('#last_name').val()))
    let nationality= $.trim(escapeHtml($('#nationality').val()))
    let birthdate= $.trim(escapeHtml($('#birthdate').val()))
    let gender= $.trim(escapeHtml($('select[name=gender]').val()))
    let cid = $.trim(escapeHtml($(selectedChar).attr('id').replace('char-', '')))
    let re = '(' + profList.join('|') + ')\\b'
    const regTest = new RegExp(re, 'i');

    if (!firstname || !lastname || !nationality || !birthdate){
        var reqFieldErr = '<p>Du har missat att skriva något!</p>'
        $('.error-msg').html(reqFieldErr)
        $('.error').fadeIn(400)
        return false;
    }

    if(regTest.test(firstname) || regTest.test(lastname)){
        var profanityErr = '<p>You have used a bad word, try again!<p>'
        $('.error-msg').html(profanityErr)
        $('.error').fadeIn(400)
        return false;
    }

    $.post('https://qb-multicharacter/createNewCharacter', JSON.stringify({
        firstname: firstname,
        lastname: lastname,
        nationality: nationality,
        birthdate: birthdate,
        gender: gender,
        cid: cid,
    }));
    $(".container").fadeOut(150);
    $('.characters-list').css("filter", "none");
    $('.character-info').css("filter", "none");
    qbMultiCharacters.fadeOutDown('.character-register', '125%', 1);
    refreshCharacters()

});

$(document).on('click', '#accept-delete', function(e){
    $.post('https://qb-multicharacter/removeCharacter', JSON.stringify({
        citizenid: $(selectedChar).data("citizenid"),
    }));
    $('.character-delete').fadeOut(150);
    $('.characters-block').css("filter", "none");
    refreshCharacters();
});

$(document).on('click', '#cancel-delete', function(e){
    e.preventDefault();
    $('.characters-block').css("filter", "none");
    $('.character-delete').fadeOut(150);
});

$(document).on('click', '#close-error', function(e){
    e.preventDefault();
    $('.characters-block').css("filter", "none");
    $('.error').fadeOut(150);
});

function setCharactersList() {
    var htmlResult = '<div class="character-list-header"></div>'
    htmlResult += '<div class="characters">'
    for (let i = 1; i <= NChar; i++) {
        htmlResult += '<div class="character" id="char-'+ i +'" data-cid=""><div class="user"><i class="fa-solid fa-plus" style="font-size: 25px;"></i></div><span id="slot-name">Empty slot<span id="cid"></span></span></div>'
    }
    htmlResult += '</div>'
    $('.characters-list').html(htmlResult)
}

function refreshCharacters() {
    var htmlResult = ''
    for (let i = 1; i <= NChar; i++) {
        htmlResult += '<div class="character" id="char-'+ i +'" data-cid=""><div class="user"><i class="fa-solid fa-plus" style="font-size: 25px;"></i></div><span id="slot-name">Empty slot<span id="cid"></span></span></div>'
    }

    $('.characters-list').html(htmlResult)
    
    setTimeout(function(){
        $(selectedChar).removeClass("char-selected");
        selectedChar = null;
        $.post('https://qb-multicharacter/setupCharacters');
        $("#delete").css({"display":"none"});
        $("#play").css({"display":"none"});
        qbMultiCharacters.resetAll();
    }, 100)
}

$("#close-reg").click(function (e) {
    e.preventDefault();
    $('.error').fadeOut(150);
    $('.characters-list').css("filter", "none")
    $('.character-info').css("filter", "none")
    qbMultiCharacters.fadeOutDown('.character-register', '125%', 1);
})

$("#close-del").click(function (e) {
    e.preventDefault();
    $('.characters-block').css("filter", "none");
    $('.character-delete').fadeOut(150);
})

$(document).on('click', '#play', function(e) {
    e.preventDefault();
    var charData = $(selectedChar).data('cid');

    if (selectedChar !== null) {
        if (charData !== "") {
            $.post('https://qb-multicharacter/selectCharacter', JSON.stringify({
                cData: $(selectedChar).data('cData')
            }));
            setTimeout(function(){
                qbMultiCharacters.fadeOutDown('.characters-list', "-40%", 1);
                qbMultiCharacters.fadeOutDown('.character-info', "-40%", 1);
                qbMultiCharacters.resetAll();
            }, 1500);
        } else {
            $('.characters-list').css("filter")
            $('.character-info').css("filter")
            qbMultiCharacters.fadeInDown('.character-register', '25%', 1);
        }
    }
});

$(document).on('click', '#delete', function(e) {
    e.preventDefault();
    var charData = $(selectedChar).data('cid');

    if (selectedChar !== null) {
        if (charData !== "") {
            $('.characters-block').css("filter")
            $('.character-delete').fadeIn(250);
        }
    }
});

qbMultiCharacters.fadeOutUp = function(element, time) {
    $(element).css({"display":"block"}).animate({top: "-80.5%",}, time, function(){
        $(element).css({"display":"none"});
    });
}

qbMultiCharacters.fadeOutDown = function(element, percent, time) {
    if (percent !== undefined) {
        $(element).css({"display":"block"}).animate({top: percent,}, time, function(){
            $(element).css({"display":"none"});
        });
    } else {
        $(element).css({"display":"block"}).animate({top: "103.5%",}, time, function(){
            $(element).css({"display":"none"});
        });
    }
}

qbMultiCharacters.fadeInDown = function(element, percent, time) {
    $(element).css({"display":"block"}).animate({top: percent,}, time);
}

qbMultiCharacters.resetAll = function() {
    $('.characters-list').hide();
    $('.characters-list').css("top", "-40");
    $('.character-info').hide();
    $('.character-info').css("top", "-40");
    $('.welcomescreen').css("top", WelcomePercentage);
    $('.server-log').show();
    $('.server-log').css("top", "25%");
    selectedChar = null;
}
