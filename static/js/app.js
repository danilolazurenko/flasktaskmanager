//definition of global variables
var timeVar;
var StartTimeStorage;
var StartDate;
var StartDateString;
var StartTimeString;
var EndDate;
var EndDateString;
var EndTimeString;
var dateObject;
var timeObject
var TimeElapsed;
var FirstnessFlag = true;
var ButtonList = [ 'start', 'stop', 'finish', 'edit', 'delete'];

// templates section
// template function for editTask function
var correctorForm = _.template(
"<h5>Provide time in hours</h5><p><input type='text' class='form-control time-corrector' name='time-corrector'></p> \
  <button class='btn btn-default corrector' id ='submitcorrection_<%= Id %>' >Correct time</button>"
  );
// template function for submitting function
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

// function for starting timer when pressing primary button
function getNeededId(self){
  var manipulator = $(self);
  var neededId = manipulator.attr('id').split('_')[1];//getting unique general value of id
  return neededId;
};
//start task function
function startTask(self){
  //if (self.attr('class') == 'disabled'){ return;}
  if (FirstnessFlag == true) {
    TimeElapsed = 0;
    FirstnessFlag = false;
    StartDate = new Date();
    StartTimeString = StartDate.toLocaleTimeString();
    StartDateString = StartDate.toLocaleDateString();
    }
  var neededId = getNeededId(self);
  var stopsel = '#stop_'+neededId;
  $( stopsel ).removeClass('disabled');
  $('.btn-primary').addClass('disabled');
  StartTimeStorage = new Date();
  timeVar = setInterval(function(){timerFunction(neededId)}, 1000)
};
//this function responsible for rendering timer
function timerFunction(Id) {
  var spanId = 'timer_' + Id;
  dateObject = new Date();
  var timeObject = dateObject.toLocaleTimeString();
  document.getElementById(spanId).innerHTML = "| Start time:" + timeObject;
};
//function for stopping timer
function stopTask(self){
  clearInterval(timeVar);
  var neededId = getNeededId(self);
  var selectorArray = createIdList('#', neededId);
  TimeElapsed += dateObject-StartTimeStorage;
  $( selectorArray['start'] ).removeClass('disabled');
  $( selectorArray['finish'] ).removeClass('disabled');
  $( selectorArray['edit'] ).removeClass('disabled');
  $( selectorArray['delete'] ).removeClass('disabled');
  $( selectorArray['stop'] ).addClass('disabled');
};
//function for finishing task and adding it's data to statistics
function finishTask(self){
  clearInterval(timeVar);
  var neededId = getNeededId(self);
  var titleSelector = '#title_'+neededId;
  var taskTitle = $(titleSelector).text();
  var taskDescription = $('#descr_'+neededId).text();
  EndDate = new Date();
  EndDateString = EndDate.toLocaleDateString();
  EndTimeString = EndDate.toLocaleTimeString();
  $.ajax({
    url: $SCRIPT_ROOT + '/finishtask',
      data: { "title": taskTitle, "timespent": TimeElapsed, "id": neededId,
              "startdate": StartDateString, "starttime": StartTimeString,
              "enddate": EndDateString, "endtime": EndTimeString,
              "description": taskDescription},
      type: 'POST',
      success: function(response){ returnToBeginning(neededId); console.log(response); },
      error: function(response){ alert("Sorry, some error occured, try again."); }
  });
};
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
};
//function that sends corrected data to server
function submitCorrectedData(self){
  var neededId = getNeededId(self);
  var titleSelector = '#title'+neededId;
  var taskTitle = $(titleSelector).text();
  var timeToSend = $(".time-corrector").val();
  var taskDescription = $('#descr_'+neededId).text();
  timeToSend *=3600000;
  EndDate = new Date();
  EndDateString = EndDate.toLocaleDateString();
  EndTimeString = EndDate.toLocaleTimeString();
  $.ajax({
    url: $SCRIPT_ROOT + '/finishtask',
    data: {'title': taskTitle, 'timespent': timeToSend, "id": neededId,
              "startdate": StartDateString, "starttime": StartTimeString,
              "enddate": EndDateString, "endtime": EndTimeString,
              "description": taskDescription},
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

//function for getting id list of list of selectors; "this" is needed, why?
function createIdList(prefix, Id){
  this.ButtonsIdArray = {};
  this.tmpId;
  for ( var key in ButtonList ){
    //this.tmpId = prefix.concat(ButtonList[key], '_' ,Id);
    this.ButtonsIdArray[ButtonList[key]]=prefix.concat(ButtonList[key], '_' ,Id);
    }
  return this.ButtonsIdArray
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
  submitTask();
  });

$('.btn-primary').on("click", function(){
  startTask(this);
  });

$('.btn-info').on("click", function(){
  stopTask(this);
  });

$('.btn-success').on("click", function(){
  finishTask(this);
  });

$(".btn-warning").on("click", function(){
  editTask(this);
  });

$('.btn-danger').on("click", function(){
  deleteTask(this);
  });


});
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
          startid:idArray['start'], stopid:idArray['stop'], finishid:idArray['finish'], editid:idArray['edit'], deleteid:idArray['delete']});
        $('ul:last-child').append(taskRecord);
        idArray = createIdList('#', idNumber);
        $(idArray['start']).on("click", function(){
         startTask(this);
        });

        $(idArray['stop']).on("click", function(){
        stopTask(this);
        });

        $(idArray['finish']).on("click", function(){
         finishTask(this);
        });

        $(idArray['edit']).on("click", function(){
        editTask(this);
        });

        $(idArray['delete']).on("click", function(){
         deleteTask(this);
        });

      },
      error: function(response){ alert('Something bad happened.'); }
    });
  };
