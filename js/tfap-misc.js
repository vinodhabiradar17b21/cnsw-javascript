$(document).ready(function(){
		
		jQuery.validator.addMethod('pwdStrength', function(value, element){
			const regex = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[@$!%*#?&])[0-9a-zA-Z@$!%*#?&]{8,}/g;
			if(regex.exec(value) == null){
				return false;
			}
			
			return true;
		});
		
		$("#tfapcpform").submit(function(e){
			e.preventDefault();
			
			var postAction = $(this).attr('action');
			var formData = $(this).serialize();
			
			
			var validator = $("#tfapcpform").validate({
				rules: {
					pwd: {
						required: true,
						minlength: 8,
						pwdStrength: true
					},
					
					confirmPwd: {
						required: true,
						minlength: 8,
						equalTo: "#pwd"
					}
				},
				messages: {
					pwd: {
						pwdStrength: "Password must be a combination of at least one UPPERCASE, one lowercase, numbers and these special characters (e.g @$!%*#?&)"
					},
					confirmPwd: {
						equalTo: "Password and password confirmation do not match."
					}
				}
			}).form();
			
			if($("#tfapcpform").valid()){
				 console.log(postAction);
				 $.post( postAction, formData, function( response ) {
					console.log("response: " + response);
					
					 if(response.error != undefined){
						 swal(response.error, "", "warning");
					 } else {
						 swal(response.success, "","info").then(function() {
							 window.location.href = response.redirect;
			             }); 
					 }
					 
					 
//					bootbox.alert(response.message, function(){
//						if(response.success){
//							window.location.href = response.success;
//						} else if (response.success == ''){
//							window.location.href = '/internalLogin';
//						}
//					}); 
				 });
			}
		});
	});