function singleuploadFile(e){
	
	// disabled and enabled field while file uploading time
	var nextSpan = $(e).next();
	var firstEl = $(nextSpan[0].children[0]).addClass('hidden');
	var secondEl = $(nextSpan[0].children[1]).removeClass('hidden');
	var labelDisabled = $($(e.target).closest('label')).addClass('disabled');
	e.disabled = true;

	// append to from data
	var td = $(e).closest('section');
	var formData = new FormData();
	formData.append("transId", td[0].dataset.trasactionid);
	
	$.each(e.files, function(index, item){
		formData.append("file", e.files[index]);
	})

	var ajax = $.ajax({
		url: "/TFAPortal/tfApplication/" + td[0].dataset.endpoint,
		type: "POST",
		data: formData,
        processData: false,
		contentType: false
	});
	
	ajax.done(function(res){		
		if(td[0].dataset.callback){
			eval(td[0].dataset.callback + '('+res+')');
		}
		buttonEnable(nextSpan, e);
	});
	
	ajax.fail(function(res){
		if(td[0].dataset.callback){
			eval(td[0].dataset.callback + '('+JSON.stringify(res)+')');
		}
		buttonEnable(nextSpan, e);
	});

}

function buttonEnable(nextSpan, e){
	var firstEl = $(nextSpan[0].children[0]).removeClass('hidden');
	var secondEl = $(nextSpan[0].children[1]).addClass('hidden');
	var labelDisabled = $($(e.target).closest('label')).removeClass('disabled');
	e.disabled = false;
	e.value = '';
}

$('.filesUpload').on('change', function(e){
	uploadFile(e);
});

