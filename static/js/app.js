//definition of global variables
var timeVar;
var StartTimeStorage;
var d;
var TimeElapsed;
var FirstnessFlag = true;
var ButtonList = [ 'start', 'stop', 'finish', 'edit', 'delete'];

//function for starting timer when pressing primary button
function getNeededId(self){
  this.manipulator = $(self);
  this.neededId = manipulator.attr('id');
  this.neededId = this.neededId.split('_');
  this.neededId = this.neededId[1];
  return this.neededId;
};

function startTask(self){
  if (FirstnessFlag == true) {TimeElapsed = 0; FirstnessFlag = false;}
  var neededId = getNeededId(self);
  var stopsel = '#stop_'+neededId;
  $( stopsel ).removeClass('disabled');
  $('.btn-primary').addClass('disabled');
  StartTimeStorage = new Date();
  timeVar = setInterval(function(){timerFunction(neededId)}, 1000)
};

function timerFunction(Id) {
  var spanId = 'timer_' + Id;
  d = new Date();
  var t = d.toLocaleTimeString();
  document.getElementById(spanId).innerHTML = "| Start time:" + t;
};
//function for stopping timer
function stopTask(self){
  clearInterval(timeVar);
  var neededId = getNeededId(self);
  var selectorArray = createIdList('#', neededId);
  TimeElapsed += d-StartTimeStorage;
  $( selectorArray[0] ).removeClass('disabled');
  $( selectorArray[1] ).addClass('disabled');
  $( selectorArray[2] ).removeClass('disabled');
  $( selectorArray[3] ).removeClass('disabled');
  $( selectorArray[4] ).removeClass('disabled');
};
//function for finishing task and adding it's data to statistics
function finishTask(self){
  var neededId = getNeededId(self);
  var titleSelector = '#title_'+neededId;
  var taskTitle = $(titleSelector).text();
  clearInterval(timeVar);
  $.ajax({
    url: $SCRIPT_ROOT + '/finishtask',
      data: {"title": taskTitle, "timespent": TimeElapsed, "id": neededId},
      type: 'POST',
      success: function(response){ returnToBeginning(neededId); },
      error: function(response){ alert("Sorry, some error occured, try again."); }
  });
};
// Template function for editTask function
var correctorForm = _.template(
"<h5>Provide time in hours</h5><p><input type='text' class='form-control time-corrector' name='time-corrector'></p> \
  <button class='btn btn-default corrector' id ='submitcorrection_<%= Id %>' >Correct time</button>"
  );

//function for editing time before adding it to statistics
function editTask(self){
  clearInterval(timeVar);
  var neededId = getNeededId(self);
  sel = '#editor_' + neededId;
  StringToAppend = correctorForm({Id: neededId});
  $(sel).append(StringToAppend);
  $(".corrector").on("click", function(){
    var submitCorrection = submitCorrectedData(this);
    });
}
//function that sends corrected data to server
function submitCorrectedData(self){
  var neededId = getNeededId(self);
  var titleSelector = '#title'+neededId;
  var taskTitle = $(titleSelector).text();
  var timeToSend = $(".time-corrector").val();
  timeToSend *=3600000;
  $.ajax({
    url: $SCRIPT_ROOT + '/finishtask',
    data: {'title': taskTitle, 'timespent': timeToSend, "id": neededId},
    type: 'POST',
    success: function(response){ returnToBeginning(neededId); },
    error: function(response){ alert("An error occured, please try again or telephone to admin.");}
    });
};
//function for deleting task
function deleteTask(self){
clearInterval(timeVar);
var neededId = getNeededId(self);
$.ajax({
   url: $SCRIPT_ROOT + '/delete',
   data: {'id': neededId},
   type: 'POST',
   success: function(response){ returnToBeginning(neededId); },
   error: function(response){ alert('Error during deletion happened, try again.')}
   });
}

//function for getting id list of list of selectors
function createIdList(prefix, Id){
  this.resultArray = [];
  for ( var key in ButtonList ){
    this.tmpId = prefix.concat(ButtonList[key], '_' ,Id);
    this.resultArray.push(this.tmpId);
    }
  return this.resultArray
};
//function for returning to primordial state
function returnToBeginning(neededId){
  sel = '#'+neededId;
  $(sel).remove();
  FirstnessFlag = true;
  TimeElapsed = 0;
  $('button').addClass('disabled');
  $('.btn-primary').removeClass('disabled');
  $('.btn-default').removeClass('disabled');
};


$(document).ready(function(){
$('#submit').on("click", function(){
  var submitter = submitTask();
  });

$('.btn-primary').on("click", function(){
  var starter = startTask(this);
  });

$('.btn-info').on("click", function(){
  var stopper = stopTask(this);
  });

$('.btn-success').on("click", function(){
  var finisher = finishTask(this);
  });

$(".btn-warning").on("click", function(){
  var editor = editTask(this);
});

$('.btn-danger').on("click", function(){
  var deleter = deleteTask(this);
});
});
//template function for submitting function
var recordToAppend = _.template(
 "<li id = '<%= Id %>' ><h3><span id= 'title_<%= Id %>' > \
 <%= title %> </span><span id= 'timer_<%= Id %>' ></span> \
 <button class='btn btn-default btn-primary' id = '<%= startid %>' >Start task</button> \
 <button class='btn btn-info disabled' id='<%= stopid %>' >Stop time</button> \
 <button class='btn btn-success disabled' id ='<%= finishid %>' >Finish task</button> \
 <button class='btn btn-warning disabled' id='<%= editid %>'>Edit time</button> \
 <button class='btn btn-danger disabled' id ='<%= deleteid %>'>Delete task</button> \
 </h3><h4>Description</h4><p> <%= description %> \
 </p><p><span id = 'editor_<%= Id %>' ></span></p> </li>"
);

//submitter function
var submitTask = function(){
    event.preventDefault();
    $.ajax({
      url: $SCRIPT_ROOT + '/add',
      data: $('form#task-manager').serialize(),
      type: 'POST',
      success: function(response){
        var responseFromServer = $.parseJSON(response);
        idNumber = responseFromServer['id']['id'];
        var idArray = createIdList('', idNumber)
        var taskTitle = $("input[name|='title']").val();
        var taskDescription = $("textarea[name|='description']").val();
        var taskRecord = recordToAppend({Id: idNumber, title: taskTitle, description: taskDescription,
          startid:idArray[0], stopid:idArray[1], finishid:idArray[2], editid:idArray[3], deleteid:idArray[4]});
        $('ul:last-child').append(taskRecord);

        $('.btn-primary').on("click", function(){
         var starter = startTask(this);
        });

        $('.btn-info').on("click", function(){
        var stopper = stopTask(this);
        });

        $('.btn-success').on("click", function(){
         var finisher = finishTask(this);
        });

        $(".btn-warning").on("click", function(){
        var editor = editTask(this);
        });

        $('.btn-danger').on("click", function(){
         var deleter = deleteTask(this);
        });

      },
      error: function(response){ alert('Something bad happened.'); }
    });
  };
