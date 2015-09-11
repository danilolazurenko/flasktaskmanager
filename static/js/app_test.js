var timeVar;
var StartTimeStorage;
var d;
var TimeElapsed;
var FirstnessFlag = true;

$(document).ready(function(){
$('#submit').on("click", function(){var submitter = submitTask();});

$('.btn-primary').on("click", function(){
          if (FirstnessFlag == true) {TimeElapsed = 0; FirstnessFlag = false;}
          var needed_id = $(this).attr('id');
          needed_id = needed_id.substring(0, needed_id.length-1);
          var info_sel = '#'+needed_id + 'i';
          $( info_sel ).removeClass('disabled');
          $('.btn-primary').addClass('disabled');
          StartTimeStorage = new Date();
          timeVar = setInterval(function(){timerFunction()}, 1000)

          function timerFunction() {
            var span_id = needed_id + 'r';
            d = new Date();
            var t = d.toLocaleTimeString();
            document.getElementById(span_id).innerHTML = "| Start time:" + t;
          }
        });

$('.btn-info').on("click", function(){
  clearInterval(timeVar);
  var needed_id = $(this).attr('id');
  needed_id = needed_id.substring(0, needed_id.length-1);
  var start_sel = '#'+needed_id + 'p';
  var info_sel = '#'+needed_id + 'i';
  var finish_sel = '#' + needed_id +'f';
  var edit_sel = '#' + needed_id + 'w';
  var delete_sel = '#' + needed_id +'d';
  TimeElapsed += d-StartTimeStorage;
  $( info_sel).addClass('disabled');
  $( start_sel ).removeClass('disabled');
  $( finish_sel ).removeClass('disabled');
  $( edit_sel ).removeClass('disabled');
  $( delete_sel ).removeClass('disabled');
  });

$('.btn-success').on("click", function(){
                          var needed_id = $(this).attr('id');
                          needed_id = needed_id.substring(0, needed_id.length-1);
                          var title_selector = '#'+needed_id +'title';
                          var task_title = $(title_selector).text();
                          clearInterval(timeVar);
                                  $.ajax({
                                    url: $SCRIPT_ROOT + '/finishtask',
                                    data: {"title": task_title, "timespent": TimeElapsed, "id": needed_id},
                                    type: 'POST',
                                    success: function(response){
                                                              sel = '#'+needed_id;
                                                              $(sel).remove();
                                                              FirstnessFlag = true;
                                                              TimeElapsed = 0;
                                                              $('button').addClass('disabled');
                                                              $('.btn-primary').removeClass('disabled');
                                                             },
                                    error: function(response){console.log(response);}
                                  });
        });

$(".btn-warning").on("click", function(){
  clearInterval(timeVar);
  var needed_id = $(this).attr('id');
  needed_id = needed_id.substring(0, needed_id.length-1);
  sel = '#' + needed_id + 'c';
  string_to_append ="<h5>Provide time in hours</h5>"+
                    "<p><input class='form-control time-corrector' name='time-corrector'></p>"+
  "<button class='btn btn-default corrector' id =" + needed_id + "o" + " >Correct time</button>"
  $(sel).append(string_to_append);
  $(".corrector").on("click", function(){
                          var needed_id = $(this).attr('id');
                          needed_id = needed_id.substring(0, needed_id.length-1);
                          var title_selector = '#'+needed_id +'title';
                          var task_title = $(title_selector).text();
                          var timeToSend = $(".time-corrector").val();
                          timeToSend *=3600000;
                                  $.ajax({
                                    url: $SCRIPT_ROOT + '/finishtask',
                                    data: {'title': task_title, 'timespent': timeToSend, "id": needed_id},
                                    type: 'POST',
                                    success: function(response){
                                                              sel = '#'+needed_id;
                                                              $(sel).remove();
                                                              FirstnessFlag = true;
                                                              TimeElapsed = 0;
                                                              $('button').addClass('disabled');
                                                              $('.btn-primary').removeClass('disabled');
                                                             },
                                    error: function(response){console.log(response);}
                                  });
        });
});

$('.btn-danger').on("click", function(){
                          clearInterval(timeVar);
                          var needed_id = $(this).attr('id');
                          needed_id = needed_id.substring(0, needed_id.length-1);
                          $.ajax({
                                  url: $SCRIPT_ROOT + '/delete',
                                  data: {'id': needed_id},
                                  type: 'POST',
                                  success: function(response){
                                                              sel = '#'+needed_id;
                                                              $(sel).remove();
                                                              TimeElapsed =0;
                                                              FirstnessFlag = true;
                                                              $('button').addClass('disabled');
                                                              $('.btn-primary').removeClass('disabled');
                                                             },
                                  error: function(response){console.log(response);}
                                  });
                          });
});

var submitTask = function(){
    event.preventDefault();
    $.ajax({
      url: $SCRIPT_ROOT + '/add',
      data: $('form#task-manager').serialize(),
      type: 'POST',
      success: function(response){
        var response_from_server = $.parseJSON(response);
        id_number = response_from_server['id']['id'];
        var start_sel = id_number + "p";
        var finish_sel = id_number + "f";
        var info_sel = id_number + "i";
        var edit_sel = id_number + "w";
        var delete_sel = id_number + "d";
        var task_record = "<li id= " + id_number +" ><h3><span id=" + id_number + "title" + " >" +
                          $("input[name|='title']").val() + "</span><span id= " +
                          id_number + "r" + "></span><button class='btn btn-default btn-primary'" + "id =" +
                          start_sel + " >Start task</button>" +
                          "<button class='btn btn-info disabled' id=" + info_sel + " >Stop time</button>" +
                          "<button class='btn btn-success disabled' id =" + finish_sel + ">Finish task</button>" +
                          "<button class='btn btn-warning disabled' id=" + edit_sel + ">Edit time</button>" +
                          "<button class='btn btn-danger disabled' id =" + delete_sel + ">Delete task</button>"+
                          "</h3><h4>Description</h4><p>" + $("textarea[name|='description']").val() +
                          "</p> <p><span id = " + id_number + 'c' + " ></span></p> " + "</li>";
        $('ul:last-child').append(task_record);

        $('#'+start_sel).on("click", function(){
          if (FirstnessFlag == true) {TimeElapsed = 0; FirstnessFlag = false;}
          var needed_id = $(this).attr('id');
          needed_id = needed_id.substring(0, needed_id.length-1);
          ar info_sel = '#'+needed_id + 'i';
          $( info_sel ).removeClass('disabled');
          $('.btn-primary').addClass('disabled');
          StartTimeStorage = new Date();
          timeVar = setInterval(function(){timerFunction()}, 1000)

          function timerFunction() {
            var span_id = needed_id + 'r';
            d = new Date();
            var t = d.toLocaleTimeString();
            document.getElementById(span_id).innerHTML = "| Start time:" + t;
          }
        });

        $('#'+info_sel).on("click", function(){
              clearInterval(timeVar);
              var needed_id = $(this).attr('id');
              needed_id = needed_id.substring(0, needed_id.length-1);
              var start_sel = '#'+needed_id + 'p';
              var info_sel = '#'+needed_id + 'i';
              var finish_sel = '#' + needed_id +'f';
              var edit_sel = '#' + needed_id + 'w';
              var delete_sel = '#' + needed_id +'d';
              TimeElapsed += d-StartTimeStorage;
              $( info_sel).addClass('disabled');
              $( start_sel ).removeClass('disabled');
              $( finish_sel ).removeClass('disabled');
              $( edit_sel ).removeClass('disabled');
              $( delete_sel ).removeClass('disabled');
            });

        $('#'+finish_sel).on("click", function(){
                          var needed_id = $(this).attr('id');
                          needed_id = needed_id.substring(0, needed_id.length-1);
                          var title_selector = '#'+needed_id +'title';
                          var task_title = $(title_selector).text();
                          clearInterval(timeVar);
                                  $.ajax({
                                    url: $SCRIPT_ROOT + '/finishtask',
                                    data: {"title": task_title, "timespent": TimeElapsed, "id": needed_id},
                                    type: 'POST',
                                    success: function(response){
                                                              sel = '#'+needed_id;
                                                              $(sel).remove();
                                                              FirstnessFlag = true;
                                                              TimeElapsed = 0;
                                                              $('button').addClass('disabled');
                                                              $('.btn-primary').removeClass('disabled');
                                                             },
                                    error: function(response){console.log(response);}
                                  });
        });

        $('#'+edit_sel).on("click", function(){
                    clearInterval(timeVar);
                    var needed_id = $(this).attr('id');
                    needed_id = needed_id.substring(0, needed_id.length-1);
                    sel = '#' + needed_id + 'c';
                    string_to_append ="<h5>Provide time in hours</h5>"+
                    "<p><input class='form-control time-corrector' name='time-corrector'></p>"+
                    "<button class='btn btn-default corrector' id =" + needed_id + "o" + " >Correct time</button>"
                    $(sel).append(string_to_append);
                    $(".corrector").on("click", function(){
                          var needed_id = $(this).attr('id');
                          needed_id = needed_id.substring(0, needed_id.length-1);
                          var title_selector = '#'+needed_id +'title';
                          var task_title = $(title_selector).text();
                          var timeToSend = $(".time-corrector").val();
                          timeToSend *=3600000;
                                  $.ajax({
                                    url: $SCRIPT_ROOT + '/finishtask',
                                    data: {'title': task_title, 'timespent': timeToSend, "id": needed_id},
                                    type: 'POST',
                                    success: function(response){
                                                              sel = '#'+needed_id;
                                                              $(sel).remove();
                                                              FirstnessFlag = true;
                                                              TimeElapsed = 0;
                                                              $('button').addClass('disabled');
                                                              $('.btn-primary').removeClass('disabled');
                                                             },
                                    error: function(response){console.log(response);}
                                  });
                          });
                  });

        $('#'+delete_sel).on("click", function(){
                          clearInterval(timeVar);
                          var needed_id = $(this).attr('id');
                          needed_id = needed_id.substring(0, needed_id.length-1);
                          $.ajax({
                                  url: $SCRIPT_ROOT + '/delete',
                                  data: {'id': needed_id},
                                  type: 'POST',
                                  success: function(response){
                                                              sel = '#'+needed_id;
                                                              $(sel).remove();
                                                              FirstnessFlag = true;
                                                              TimeElapsed = 0;
                                                              $('button').addClass('disabled');
                                                              $('.btn-primary').removeClass('disabled');
                                                             },
                                  error: function(response){console.log(response);}
                                  });
                          });
      },
      error: function(response){console.log(response);}
    });
  };



