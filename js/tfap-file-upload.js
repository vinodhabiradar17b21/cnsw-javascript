function uploadFile(e){	
	
	// disabled and enabled field while file uploading time
	e.target.disabled = true;

	// append to from data
	var td = $(e.target).closest('div');
	var formData = new FormData();
	
	formData.append("tfbotId", td[0].dataset.tfbotid);
	formData.append("docType",td[0].dataset.doctype);
	
	$.each(e.target.files, function(index, item){
		formData.append("file", e.target.files[index]);
	})
	debugger
	var ajax = $.ajax({
		url: "/TFAPortal/tfApplication/" + td[0].dataset.endpoint,
		type: "POST",
		data: formData,
        processData: false,
		contentType: false
	});
	debugger
	ajax.done(function(res){		
		if(td[0].dataset.callback){
			eval(td[0].dataset.callback + '('+res+')');
		}
	});
	
	ajax.fail(function(res){
		if(td[0].dataset.callback){
			eval(td[0].dataset.callback + '('+JSON.stringify(res)+')');
		}
	});

}

$('.fieldUploadFile').on('change', function(e){
	debugger
	uploadFile(e);
});

