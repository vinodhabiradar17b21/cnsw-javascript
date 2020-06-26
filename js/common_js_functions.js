/**
 * Common Javascript functions
 */
function upperCaseF(a){
    setTimeout(function(){
        a.value = a.value.toUpperCase();
    }, 1);
}

function trimUserName(item){
	item.value = item.value.trim();
}