/**
 * Common Javascript functions for tfap
 */

$(document).ready(function () {

    $('input.decimal-input').on("keypress", function (event) {
    	var value = event.target.value,
    		maxLen = parseInt(event.target.maxLength),
    		// decLen = parseInt(event.target.dataset.decimal),
			// vincent intLen should not include include decimal places. tehre are currency codes without decimal
			// please go check swift format on d. e.g. 15d is inclusive of the decimal place
    		// intLen = maxLen - (decLen + 1);
    		intLen = maxLen;

    	if((event.which < 46 || event.which > 57 || event.which == 47 ) || 
    			( value.indexOf('.') !== -1 && event.which == 46) || 
    			( value.indexOf('.') == -1 && value.length >= intLen && event.which !== 46) || 
    			value.indexOf('.') !== -1 && value.split('.')[0].length > intLen ){
    		event.preventDefault();
    	}
    });
    

    $('input.decimal-input').on("keyup", function (event) {
    	var value = event.target.value,
			maxLen = parseInt(event.target.maxLength),
			// decLen = parseInt(event.target.dataset.decimal),
			// vincent intLen should not include include decimal places. tehre are currency codes without decimal
			// please go check swift format on d. e.g. 15d is inclusive of the decimal place
			// intLen = maxLen - (decLen + 1);
			intLen = maxLen;

    	if( value.indexOf('.') != -1 && value.split('.')[1].length > parseInt(event.target.dataset.decimal)){
    		event.target.value = parseFloat(event.target.value).toFixed(parseInt(event.target.dataset.decimal));
    	}else if( value.split('.')[0].length > intLen ){
    		event.target.value = '';
    	}
    })
    
    
    $('input.decimal-input').on("paste",function(e) {
    	var value = e.originalEvent.clipboardData.getData('Text');
    	var isLatters = /[a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?]/g.test(value); // only allow dot and numbers
    	if( value.indexOf('.') != -1 && value.split('.')[1].length > parseInt(event.target.dataset.decimal) && !isLatters){
    		event.target.value = parseFloat(value).toFixed(parseInt(event.target.dataset.decimal));
    	}else{
    		event.target.value = '';
    		e.preventDefault();
    	}
    });
    
});


/*
 * TFAP Textarea manipulator
 * Parameters:maxLines,maxLengthOfLine,
 */
$.fn.tfapTextareaManipulator = function (options) {
	var defaults = {
		//maxLength: null,
		maxLines: null,
		maxLengthOfLine : null,
		charCountElem : null,
		lineCountElem : null
	};

	options = $.extend(defaults, options);

	//var elem = this;
	var textarea = $(this);
	var maxLines = options.maxLines;
	var maxLengthOfLine = options.maxLengthOfLine
	var charCountElem = options.charCountElem;
	var lineCountElem = options.lineCountElem;
	var maxCharCount = maxLines*maxLengthOfLine; 
	var maxLengthOfLineWithLineBreak = maxLengthOfLine+1

	if(!maxLines){
		throw new Error('parameter maxLines is required.');
	}
	if(!maxLengthOfLine){
		throw new Error('parameter maxLengthOfLine is required.');
	}
	if(!charCountElem){
		throw new Error('parameter charCountElem is required.');
	}
	if(!lineCountElem){
		throw new Error('parameter lineCountElem is required.');
	}
	//maxCharCount = maxLines*maxLengthOfLine;
	setRemainingCounts();
	
	
	$(textarea).on('focusout change', function(e){
		setTimeout(function(){
			$(this).trigger('keypress');
		},1000);
	});

	$(textarea).on('keyup keypress', function(e){
		var lines = $(textarea).val().split(/\n/);
		var lp = e.target.value.slice(0, e.target.selectionStart);
		
		$.when($.each(lines, function(){
			if(lines.length > maxLines){
				lines.pop();
			}
		})).done(function(){
			$(textarea).val(lines.join('\n'));
			/*	additionalCountForLines added to count line break character as 2 characters. 
			 *	Because java convert line break character to two characters
			 */
			//var additionalCountForLines = lines.length-1;
			var additionalCountForLines = 0;
			
			for(var i=0; i<lines.length; i++){
				var line = lines[i];
				if(line.length >= maxLengthOfLineWithLineBreak){
					var arr = line.split('');
					arr.splice(maxLengthOfLine, 0, '\n');

					line = arr.join('');
					lines[i] = line;
					
					var formattedText ='';
					var nextLine = lines[i+1];
					if(nextLine !=null && nextLine.length >= maxLengthOfLineWithLineBreak) {
						formattedText = lines.join('');
					}
					else {
						formattedText = lines.join('\n');
					}
					
					formattedText = formattedText.substr(0, maxCharCount-additionalCountForLines);
					
					var templines = formattedText.split(/\n/);
					if(templines.length > maxLines){
						templines.pop();
						templines[templines.length-1].replace(/\n/, '');
						formattedText = templines.join('\n');
					}

					$(textarea).val(formattedText);
					lines = $(textarea).val().split(/\n/);
					
				}
			}

			$(textarea).val($(textarea).val().substr(0, maxCharCount-additionalCountForLines));
			var charCount = $(textarea).val().length;
			//additionalCountForLines = lines.length-1;
			additionalCountForLines = 0;
			
			if(charCount+additionalCountForLines>=maxCharCount){ 
				e.preventDefault();
			}else if(lines.length >= maxLines){
				if(e.which==13){   
					e.preventDefault();
				}
			}
			
			setRemainingCounts();
		});
		
		$(this).prop('selectionEnd',lp.length);
	});

	
	function setRemainingCounts(){
		
		var lines = $(textarea).val().split(/\n/);
		var charCount = $(textarea).val().length;
		var lineCount = lines.length;
		//var lineBreaks = lines.length-1;
		var lineBreaks = 0;
		var lastLine = lines[lines.length-1];
		
/*		if(lastLine=='' && lineCount<maxLines-1){
			lineCount = lines.length-1;
		}
		if(!/\n/.test(lastLine.slice(-1))){
			if(lineCount<maxLines-1){
				lineBreaks = lineBreaks-1;
			}
			
			if(maxLines == lineCount){
				lineBreaks = lineBreaks-1;
			}
			
		}*/
		

		if(lineCount==1){
			if(lines[lineCount-1]==''){
				lineCount = 0;
			}
		}
		
		$(charCountElem).text(maxCharCount-charCount-lineBreaks);
		$(lineCountElem).text(maxLines-lineCount);
		
		if((maxCharCount-charCount-lineBreaks)< 0){
			$(textarea).trigger('keypress');
		}
	}

}



/*
* TFAP Date Validator
*/

$.fn.tfapDateValidator = function (options) {
	var dateFormats = {
		'1' : 'YYYY-MM-DD', // default
		'2' : 'DD/MM/YYYY'
	};
	
	var defaults = {
		errElem: null,
		minDate: null,
		maxDate : null,
		format : 1,
		onError : function(){}
    };
	

    options = $.extend(defaults, options);
    
    var elem = this;
    var minDate = options.minDate;
    var maxDate = options.maxDate;
    var format = options.format;
    var errElem = options.errElem;
    var onError = options.onError;
    var _hiddenVal = '';
	
    if($(elem).prop('disabled')){
		return;
	}
    
    if(minDate){
    	minDate = moment(minDate);
    }
    if(maxDate){
    	maxDate = moment(maxDate);
    }
    
    setTimeout(function(){
    	if($(elem).val() != ''){
    		$(elem).trigger('keyup');
    	}
    },500);
    
    $(this).on("change",  function (e) {
    	if(e.target.value.length == 0){
    		hideErrors();
    		_hiddenVal = '';
    		
    	}
    });
    
	$(this).on("keyup change",  function (e) {
		var value = e.target.value;
		var length = value.length;

		if(length == 0){
			onError();
		}
		
		if(length >= 11){
			setValidationStatus(e, false);
			return;
		}
		
		if(_hiddenVal.length > length){
			setValidationStatus(e, true);
			return;
		}
		
		
		validate(e, getRegex(length));
		
		
		if(length == 10){
			/*var minDate = moment();
			var maxDate = moment();*/
			
			var currentDate = moment(value, dateFormats[format]);
			//console.log('minDate: ', minDate);
			//console.log('currentDate: ', currentDate);
			
			if(currentDate.isValid()){
				var hasErr = false;
				if(minDate){
					var minDateCopy = minDate.format(dateFormats[format]);
					if(moment(minDateCopy, dateFormats[format]).subtract(1, 'day').isBefore(currentDate)){
						if(!hasErr){
							hideErrors();
						}
						//console.log('before ok')
					}else{
						hasErr = true;
						var errTxt = "Dates before " + minDate.format(dateFormats[format]) + " are not allowed";
						showErrors(errTxt);
						onError();
						//console.log('before not ok')
						
					}
				}
				
				if(maxDate){
					if(maxDate.isAfter(currentDate)){
						if(!hasErr){
							hideErrors();
						}
						//console.log('after ok')
					}else{
						hasErr = true;
						var errTxt = "Dates after " + maxDate.format(dateFormats[format]) + " are not allowed";
						showErrors(errTxt);
						onError();
						//console.log('after not ok')
					}
				}
			}
		}
    });
	
	function getRegex(length){
		var regex = /^([0-9])+/;
	
		if(format == 1){
			if(length == 1){
				regex = /^([0-9]{1})$/
			}else if(length == 2){
				regex = /^([0-9]{2})$/
			}else if(length == 3){
				regex = /^([0-9]{3})$/
			}else if(length == 4){
				regex = /^([0-9]{4})$/
			}else if(length == 5){
				regex = /^([0-9]{4})(\-)$/
			}else if(length == 6){
				regex = /^([0-9]{4})(\-)([0-1])$/
			}else if(length == 7){
				regex = /^([0-9]{4})(\-)((0)[1-9]|(1)[0-2])$/
			}else if(length == 8){
				regex = /^([0-9]{4})(\-)((0)[1-9]|(1)[0-2])(\-)$/	
			}else if(length == 9){
				regex = /^([0-9]{4})(\-)((0)[1-9]|(1)[0-2])(\-)([0-3])$/
			}else if(length == 10){
				regex = /^([0-9]{4})(\-)((0)[1-9]|(1)[0-2])(\-)(((0)[1-9])|((1)[0-9])|((2)[0-9])|((3)[0-1]))$/
			}
		}else if(format == 2){
			if(length == 1){
				regex = /^[0-3]$/
			}else if(length == 2){
				regex = /^(((0)[1-9])|((1)[0-9])|((2)[0-9])|((3)[0-1]))$/
			}else if(length == 3){
				regex = /^(((0)[1-9])|((1)[0-9])|((2)[0-9])|((3)[0-1]))(\/)$/
			}else if(length == 4){
				regex = /^(((0)[1-9])|((1)[0-9])|((2)[0-9])|((3)[0-1]))(\/)([0-1])$/
			}else if(length == 5){
				regex = /^(((0)[1-9])|((1)[0-9])|((2)[0-9])|((3)[0-1]))(\/)((0)[1-9]|(1)[0-2])$/
			}else if(length == 6){
				regex = /^(((0)[1-9])|((1)[0-9])|((2)[0-9])|((3)[0-1]))(\/)((0)[1-9]|(1)[0-2])(\/)$/	
			}else if(length == 10){
				regex = /^(((0)[1-9])|((1)[0-9])|((2)[0-9])|((3)[0-1]))(\/)((0)[1-9]|(1)[0-2])(\/)(\d{4})$/
			}
		}
		
		
		return regex;
	}
	
	function validate(e, regex){
		if(regex.test(e.target.value)){
			setValidationStatus(e, true);
		}else{
			setValidationStatus(e, false);
		}
	}
	
	function setValidationStatus(e, status){
		if(status){
			_hiddenVal = e.target.value;
		}else{
			e.target.value = _hiddenVal;
			onError();
		}
	}
	
	function showErrors(errTxt){
		if(errElem){
			$(errElem).text(errTxt).removeClass('d-none');
			$(elem).addClass('border-danger');
		}
	}
	function hideErrors(){
		if(errElem){
			$(errElem).text('').addClass('d-none');
			$(elem).removeClass('border-danger');
		}
	}
}
