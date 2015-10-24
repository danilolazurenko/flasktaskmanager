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
var DateTimeStorage;
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
// function for updating time of task
function updateTimeData(s_datetime, e_datetime, status, task_id){
  $.ajax({
    url: $SCRIPT_ROOT + '/updatetask',
    data: {'StartingTime': s_datetime, 'EndingTime': e_datetime, 'status': status, 'task_id': task_id},
    type: 'POST',
    success: function(response){},
    error: function(response){ handleResponseFromServer(response); }
  });
};
//start task function
function startTask(self){
  //if (self.attr('class') == 'disabled'){ return;}
  if (FirstnessFlag == true) {
    TimeElapsed = 0;
    FirstnessFlag = false;
    }
  StartDate = new Date();
  StartTimeString = StartDate.toLocaleTimeString();
  StartDateString = StartDate.toLocaleDateString();
  var neededId = getNeededId(self);
  var stopsel = '#stop_'+neededId;
  $( stopsel ).removeClass('disabled');
  $('.btn-primary').addClass('disabled');
  DateTimeStorage = s_datetime = StartDateString.concat('|',StartTimeString);
  updateTimeData(s_datetime, 'Now', 'idle', neededId);
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
  var neededId = getNeededId(self);
  EndDate = new Date();
  EndTimeString = EndDate.toLocaleTimeString();
  EndDateString = EndDate.toLocaleDateString();
  e_datetime = EndDateString.concat('|', EndTimeString)
  updateTimeData(DateTimeStorage, e_datetime, 'idle', neededId);
};
//function for finishing task and adding it's data to statistics
function finishTask(self){
  clearInterval(timeVar);
  var neededId = getNeededId(self);
  EndDate = new Date();
  EndTimeString = EndDate.toLocaleTimeString();
  EndDateString = EndDate.toLocaleDateString();
  e_datetime = EndDateString.concat('|',EndTimeString);
  updateTimeData(DateTimeStorage, e_datetime, 'finished', neededId);
  sel = '#'+neededId;
  $(sel).remove();
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
    del_sel = '#'+neededId;
    $(del_sel).remove();
    });
};
//function that sends corrected data to server
function submitCorrectedData(self){
  var neededId = getNeededId(self);
  var timeToSend = $(".time-corrector").val();
  timeToSend *=3600000;
  TimeVal = StartTimeStorage.getTime();
  EndDate = new Date(timeToSend+TimeVal);
  EndDateString = EndDate.toLocaleDateString();
  EndTimeString = EndDate.toLocaleTimeString();
  e_datetime = EndDateString.concat('|', EndTimeString);
  updateTimeData(DateTimeStorage, e_datetime, 'finished', neededId);
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
    error: function(response){ handleResponseFromServer(response); }
  });
};
//function for getting id list of list of selectors; "this" is needed, why?
function createIdList(prefix, Id){
  this.ButtonsIdArray = {};
  this.tmpId;
  for ( var key in ButtonList ){
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
/*function for handling response from server*/
function handleResponseFromServer(response){
  if (response.status == 401){alert('Log in, please.');}
  else if (response.status == 403){ alert('You performed forbidden operation. If you did nothing call admin.'); }
  else if (response.status == 500){ alert('An error happened on server side. Call admin or come later.');}
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
      error: function(response){ handleResponseFromServer(response); }
    });
  };
