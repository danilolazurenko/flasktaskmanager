$(document).ready(function(){
  $('#submit').click(function(){
    console.log($('form#task-manager').serialize());
    $.ajax({
      url: $SCRIPT_ROOT + '/add',
      data: {'ok':'ok'},//$('form#task-manager').serialize(),
      type: 'POST',
      success: function(response){console.log(response);},
      error: function(response){console.log(response);}
    });
  });

});