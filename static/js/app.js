$(document).ready(function(){
  $('#submit').click(function(){
    event.preventDefault();
    $.ajax({
      url: $SCRIPT_ROOT + '/add',
      data: $('form#task-manager').serialize(),
      type: 'POST',
      success: function(response){
        var response_from_server = $.parseJSON(response);
        id_number = response_from_server['id']['id'];
        var task_record = "<li id= " + id_number +" >"+
            "<h2>"+$("input[name|='title']").val() +
             "<span id= " + id_number + "timer" + "></span>" +
              "<button class='btn btn-default btn-primary'" + "id =" + id_number + "primary" + ">Start task</button>" +
              //"<button class='btn btn-default btn-success'" + "id =" + id_number + "success" + ">Suspend task</button>" +
              "<button class='btn btn-default btn-info'" + "id =" + id_number + "info" + ">Finish task</button>"+
            "</h2><h4>Description</h4><p>" +
              $("textarea[name|='description']").val() + "</p> <h4>Time for task</h4> <p " + " id = " + id_number + "time"+">" +
              response_from_server['timefortask'] //why val() doesn't work for option?
              + "</p></li>"
        $('ul:last-child').append(task_record);
      },
      error: function(response){console.log(response);}
    });
  });

  $('.btn-primary').click(function(){
    var needed_id = $(this).attr('id')[0];
    var selector_string = "#" + "time" + needed_id;
    var time_for_task = $(selector_string).html();
    var time_for_task_in_milliseconds = time_for_task*60*1000;
    var span_id = needed_id+"timer";
    var TaskCountdown=setInterval(function(){myTimer()}, 1000);
    function myTimer() {
      //var d = new Date();
      time_for_task_in_milliseconds -= 1000;
      if (time_for_task_in_milliseconds >= 0)
        {document.getElementById(span_id).innerHTML = time_for_task_in_milliseconds/1000;}
      else {document.getElementById(span_id).innerHTML = "Task expired";
        return 0;}//d.toLocaleTimeString();}
      };
  });

function suspendTask() {clearInterval(TaskCountdown);}

  $('.btn-info').click(function(){
    var needed_id = $(this).attr('id')[0];
    $.ajax({
      url: $SCRIPT_ROOT + '/delete',
      data: {'id': $(this).attr('id')[0]},
      type: 'POST',
      success: function(response){
        sel = '#'+needed_id;
        $(sel).remove();
        suspendTask();
      },
      error: function(response){console.log(response); }
    });

  });

});