$(document).ready(function() {
	
	var valSelected = $('select[id="tfDocSdSettlement.tfdssMthd"]').children("option:selected").val();
	if(valSelected == 'DA'){
		$('#settlePId').addClass("required");
	} else {
		$('#settlePId').removeClass("required");
	}
	
	// TFAPRW-2281
	$('select[id="tfDocSdSettlement.tfdssMthd"]').change(function(e) {
		e.preventDefault();

		var selected = $(this).children("option:selected").val();
		if (selected == 'DA') {
			$('#settlePId').addClass("required");
		} else {
			$('#settlePId').removeClass("required");
		}
	});
	
	//remove hidden input to avoid issue when submitting specially if the field is not disabled
	var isDisabled = $('select[id="tfDocSdSettlement.tfdssPrincipalAccnCcy"').attr("disabled");
	if(isDisabled == undefined){
		$('input[type="hidden"][id="tfDocSdSettlement.tfdssPrincipalAccnCcy"]').remove();
	}
	
});