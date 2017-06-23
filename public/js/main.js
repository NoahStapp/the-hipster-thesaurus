$(function(){
 $('#search').on('keydown', function(e){
   if(e.keyCode === 13) {
     e.preventDefault();
     e.stopPropagation();
     // Get inputted word
     var parameters = { search: $(this).val() };
     // AJAX call to server
       $.ajax({
         url: '/hipster/search',
         data: parameters,
         success: function(wordData) {
           // Empty any previous results
           $('#leastcommon').empty();
           // Display words and their usage data
            wordData.least.forEach(function(item){
                  $('<li class="word">' + item.word + '</li>' + '<li class="usage">' + (item.usage/1000000) + ' uses per 1 million words' + '</li>').appendTo('#leastcommon');
            });  
          },
          // Display error if no synonyms are found
          error: function(xhr, status, error) {
            console.log('Error: no synonyms found ' + xhr.status);
            if (xhr.status == 400) {
              $('#leastcommon').empty();
              $('<li class="error">No synonyms found, please enter a different word</li>').appendTo('#leastcommon');
            }
          }
 
       }
      );
    }
 });
});