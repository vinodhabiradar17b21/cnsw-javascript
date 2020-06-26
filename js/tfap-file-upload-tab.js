function uploadTabFile(e){
	
	var files = Object.keys(e.target.files).map(function(item){ return e.target.files[item]}).sort(function(a,b){return a.size-b.size});
	//var files = Object.values(e.target.files).sort(function(a,b){return a.size-b.size});
	
	var td = $(e.target).closest('div');
	var nextSpan = $(e.target).next();
	
	var maxFileSize = 15728640;
	var zeroFileSize = 0; // Empty File
	var idel = '.error' + td[0].dataset.id;	

	// Allowed File extentions
	var allowedExtArr = [ "pdf", "zip", "jpg", "jpeg", "bmp", "png", "doc", "docx", "tif", "gif", "xlsx", "xls", "ppt", "pptx", "odt", "ods", "odp", "txt", "xml", "csv", "edifact", "edi", "json" ];
	// File name should not contain invalid characters (e.g. @ # $ % ^ & + = , ~ ` { } [ ] ; ) 
	var fileNameformat = /[!@#$%^&*+=\[\]{};'~`\/?]/;
	
	/* */
	var filesIndexesToUpload = [];
	var tempFormData = new FormData();
	var totalSize = 0;
	var maxUploadSize = 15728640;
	var requestCount = 0;
	
	
	var currentFiles = $('.attachment-item').length;
	console.log('currentFiles', currentFiles);
	console.log('files.length', files.length);	
	var swtFiles = $("div[data-id='modal_approve_amd_upload_swift']").find('li.attachment-item').length;
	var uploadedFileId = event.target.id;
	if(swtFiles + files.length > 8  && uploadedFileId=="modal_approve_amd_upload_swift"){
		console.log('cannot exceed 8');
		//$(idel).empty().append('<span class="red" role="alert">Maximum allowed number of attachments is 999.</span>');
		notif({
			msg : "Maximum allowed number of swift messages allowed is 8.",
			type : "danger",
			width : "900",
			position : "center",
			autohide : true
		});
		return;
	}
	
	if(currentFiles + files.length > 999){
		console.log('cannot exceed 999');
		//$(idel).empty().append('<span class="red" role="alert">Maximum allowed number of attachments is 999.</span>');
		notif({
			msg : "Maximum allowed number of attachments is 999.",
			type : "danger",
			width : "900",
			position : "center",
			autohide : true
		});
		return;
	}
	
	for(var index=0; index<files.length; index++){
		var file = files[index];
		console.log("File: ", index, " | Size: ", file.size)
		
		// to check file extension
		var extension = file.name.replace(/^.*\./, '');
		if (extension != '' && !(allowedExtArr.includes(extension.toLowerCase()))) {
			console.log("File: ", index, " Invalid File Extension");
			$(idel).empty().append('<span class="red" role="alert">Invalid File Extension.</span>');
			break;
		}
		else if( file.size > maxFileSize ){
			console.log("File: ", index, " FILE_TOO_BIG");
			$(idel).empty().append('<span class="red" role="alert">Upload limit for single file cannot exceed 15MB</span>');
			break; 
		}else if(file.size == zeroFileSize){
			console.log("File: ", index, " FILE_SIZE_ZERO");
			$(idel).empty().append('<span class="red" role="alert">File size should not be zero</span>');
			break; 
	    }else if (fileNameformat.test(file.name)){
	    	console.log("File: ", index, " INVALID_CHARACTERS");
			$(idel).empty().append('<span class="red" role="alert">File name contains invalid characters</span>');
			break;
	    }else if(file.name.length>70){
			console.log(file)
			console.log(file.name.length)
			console.log("File: ", index, " FILE_NAME_TOO_LENGTHY");
			$(idel).empty().append('<span class="red" role="alert">Filenames cannot exceed 70 characters</span>');
			break;
		}else{
			$(idel).empty();
			
			if((totalSize+file.size) > maxUploadSize || (files.length == index+1)){
				console.log("File: ", index, " TOTAL_TOO_BIG_OR_LAST_FILE");
				
				if((totalSize+file.size) > maxUploadSize){
					console.log("File: ", index, " TOTAL_TOO_BIG");
					index--;
				}else if(files.length == index+1){
					console.log("File: ", index, " LAST_FILE");
					filesIndexesToUpload.push(index);
					totalSize += file.size;
				}
				
				// append to from data
				var formData = new FormData();
				formData.append("docType", td[0].dataset.documenttype);
				formData.append("transId", td[0].dataset.trasactionid);
				formData.append("attType", td[0].dataset.attachmenttype);
				
				$.each(filesIndexesToUpload, function(_i, _findex){
					formData.append("files", files[_findex]);
				});
				
				
				var ajax = $.ajax({
					url: "/TFAPortal/tfApplication/save-attachment",
					type: "POST",
					data: formData,
			        processData: false,
					contentType: false,
					beforeSend: function(){
						requestCount++;
						filesIndexesToUpload = [];
						totalSize = 0;
						
						// disabled and enabled field while file uploading time
						var firstEl = $(nextSpan[0].children[0]).addClass('hidden');
						var secondEl = $(nextSpan[0].children[1]).removeClass('hidden');
						var labelDisabled = $($(e.target).closest('label')).addClass('disabled');
						e.target.disabled = true;
						
						// all button disable
						$('input[type=file]').prop('disabled', 'disabled');
						$('#selectedBank').prop('disabled', 'disabled');	
						$('#discard-action-btn').addClass('disabled');
						$('#reset-action-btn').addClass('disabled');
						$('#save-action-btn').addClass('disabled');
						$('.file-attach').addClass('disabled');
						
						if( $('#selectedBank').val() !== "" ){
							$('#submit_review_btn').prop('disabled', 'disabled');
						}
					}
				});
				
				ajax.done(function(res){
					var obj = JSON.parse(res);
					if(!obj.success)
					{
					swal("",obj.fileName +"already exists!" ,"warning");
					buttonEnableTab(nextSpan, e, td);
					}
					readAllTabItem(td[0].className, JSON.parse(td[0].dataset.isothers), true);			
				});
				
				ajax.fail(function(res){
					// failed
				});
				
				ajax.always(function(res){
					requestCount--;
					if(requestCount == 0){
						buttonEnableTab(nextSpan, e, td);
					}
				});
				
			}else{
				console.log("File: ", index, " ADD_TO_ARRAY");
				filesIndexesToUpload.push(index);
				totalSize += file.size;
			}
			
		}
	}
	


}

$('.filesUploadTab').on('change', function(e){
	uploadTabFile(e);
});

function buttonEnableTab(nextSpan, e, td){

	var firstEl = $(nextSpan[0].children[0]).removeClass('hidden');
	var secondEl = $(nextSpan[0].children[1]).addClass('hidden');
	var labelDisabled = $($(e.target).closest('label')).removeClass('disabled');
	e.disabled = false;
	e.target.disabled = false;
	e.target.value = '';
	e.value = '';

	// all button enable
	$('input[type=file]').prop('disabled', '');
	
	$('#discard-action-btn').removeClass('disabled');
	$('#reset-action-btn').removeClass('disabled');
	$('#save-action-btn').removeClass('disabled');
	$('.file-attach').removeClass('disabled');

	if( $('#selectedBank').val() !== ""){
		$('#submit_review_btn').prop('disabled', '');
	}
	
	if( td[0].dataset.isdisablebankspecific !== 'true' ){
		$('#selectedBank').prop('disabled', '');
	}	
}

// delete single and all uploaded file
function deleteTabItem(e){

	var td = $(e).closest('div');								    
	var formData = {
		'docType': td[0].dataset.documenttype,
		'transId': td[0].dataset.trasactionid,
		'attType': td[0].dataset.attachmenttype,
		'isDeleteAll': e.dataset.isdeleteall ? JSON.parse(e.dataset.isdeleteall) : false,
		'id': e.dataset.id ? e.dataset.id : ''
	};
	
	var ajax = $.ajax({
		url: "/TFAPortal/tfApplication/attachment/delete-attachment?" + $.param(formData),
		type: "DELETE",
        contentType: 'application/json',
	});
	
	ajax.done(function(res){
		readAllTabItem(td[0].className, JSON.parse(td[0].dataset.isothers), true);
	});
	
	ajax.fail(function(res){
		console.log(res);
	});
}

// Get all uploaded file
function readAllTabItem(itemId, isOthers, resetEl){

	var td = $('.' + itemId);									    
	var formData = {
		'docType': td[0].dataset.documenttype,
		'transId': td[0].dataset.trasactionid,
		'attType': td[0].dataset.attachmenttype
	};
	
	var ajax = $.ajax({
		url: "/TFAPortal/tfApplication/attachment/get-attachment",
		type: "GET",
        contentType: 'application/json',
		data: formData,
	});
	
	ajax.done(function(res){
		appendTabItemEach(itemId, isOthers, JSON.parse(res), resetEl);
	});
	
	ajax.fail(function(res){
		console.log('error', res);
	});
}

// element apend to html body
function appendTabItemEach( itemId, isOther, res, resetEl, isDeleteDisabled){
	
	// empty the elements inside the list
	if(resetEl){
		$('.' + itemId + ' .attachment-listing').empty();
	}
	var isVisbleInput = !isOther ? "hidden": '';
	$('.' + itemId + ' .attachment-listing')[0].dataset.count = res.read.length;
	$.each( res.read, function(index, item) {
		var isAmend = item.amended ? "disabled" : isDeleteDisabled;		
    	$('.' + itemId + ' .attachment-listing').append('<li class="attachment-item"><span><a href="/TFAPortal/tfApplication/attachment/download-attachment?tftId='+ item.tftId +'&attId='+ item.id +'">'+ item.fileName +'</a></span><input '+ isAmend +' type="text" placeholder="specify document type"  class="'+ isVisbleInput +'" onchange="editTabOtherList(this)"  data-id="'+ item.id +'" value="'+ item.othDocType +'"><i class="fa fa-spinner fa-spin fa-lg fa-fw hidden"></i><button type="button" onclick="deleteTabItem(this)" class="'+ isAmend +'" data-id="'+ item.id +'"'+ isAmend +'> <i class="fa fa-trash-o pd-lr5"></i></button></li>');
    });
	
	if( res.read.length > 0 ){
		$('.' + itemId + '-btn').show();
	}else{
		$('.' + itemId + '-btn').hide();
	}
	
}

function editTabOtherList(e){

	var nextSpan = $(e).next();
	var firstEl = $(nextSpan[0]).removeClass('hidden');	
	var td = $(e).closest('div');								    
	var formData = {
		'docType': td[0].dataset.documenttype,
		'transId': td[0].dataset.trasactionid,
		'attType': td[0].dataset.attachmenttype
	};
	
	var otherObj = [{
		"id": parseInt(e.dataset.id),
		"docType": e.value
	}];
	
	var ajax = $.ajax({
		url: "/TFAPortal/tfApplication/attachment/edit-attachment?" + $.param(formData),
		type: "POST",
		contentType: "application/json",
		data: JSON.stringify(otherObj),
	});
	
	ajax.done(function(res){
		readAllTabItem(td[0].className, JSON.parse(td[0].dataset.isothers), true);
	});
	
	ajax.fail(function(res){
		console.log('error', res);
	});
}
