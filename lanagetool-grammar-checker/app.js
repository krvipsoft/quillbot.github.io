
/************************************************************************************************************
	Grammar Checker
	
	Author: Linang Data
	
	Created: August, 10 2018
		
	(c)  Copyright Linang Data. All rights reserved
***********************************************************************************************************  */
document.addEventListener('DOMContentLoaded', function() {
  $('.btn').button();

  app = {
    clean : true,
    grammar : true,
    langs :[
      {"name":"自动检测语言","code":"auto","longCode":"auto"},
      {"name":"白俄罗斯语","code":"be","longCode":"be-BY"},
      {"name":"Breton","code":"br","longCode":"br-FR"},
      {"name":"Catalan","code":"ca","longCode":"ca-ES"},
      {"name":"Catalan (Valencian)","code":"ca","longCode":"ca-ES-valencia"},
      {"name":"中文","code":"zh","longCode":"zh-CN"},
      {"name":"丹麦语","code":"da","longCode":"da-DK"},
      {"name":"荷兰语","code":"nl","longCode":"nl"},
      {"name":"英语","code":"en","longCode":"en"},
      {"name":"English (Australian)","code":"en","longCode":"en-AU"},
      {"name":"English (Canadian)","code":"en","longCode":"en-CA"},
      {"name":"English (GB)","code":"en","longCode":"en-GB"},
      {"name":"English (New Zealand)","code":"en","longCode":"en-NZ"},
      {"name":"English (South African)","code":"en","longCode":"en-ZA"},
      {"name":"English (US)","code":"en","longCode":"en-US"},
      {"name":"Esperanto","code":"eo","longCode":"eo"},
      {"name":"法语","code":"fr","longCode":"fr"},
      {"name":"加利西亚语","code":"gl","longCode":"gl-ES"},
      {"name":"德语","code":"de","longCode":"de"},
      {"name":"German (Austria)","code":"de","longCode":"de-AT"},
      {"name":"German (Germany)","code":"de","longCode":"de-DE"},
      {"name":"German (Swiss)","code":"de","longCode":"de-CH"},
      {"name":"Greek","code":"el","longCode":"el-GR"},
      {"name":"意大利语","code":"it","longCode":"it"},
      {"name":"日语","code":"ja","longCode":"ja-JP"},
      {"name":"Khmer","code":"km","longCode":"km-KH"},
      {"name":"Persian","code":"fa","longCode":"fa"},
      {"name":"波兰语","code":"pl","longCode":"pl-PL"},
      {"name":"葡萄牙语","code":"pt","longCode":"pt"},
      {"name":"Portuguese (Angola preAO)","code":"pt","longCode":"pt-AO"},
      {"name":"Portuguese (Brazil)","code":"pt","longCode":"pt-BR"},
      {"name":"Portuguese (Mozambique preAO)","code":"pt","longCode":"pt-MZ"},
      {"name":"Portuguese (Portugal)","code":"pt","longCode":"pt-PT"},
      {"name":"罗马尼亚语","code":"ro","longCode":"ro-RO"},
      {"name":"俄语","code":"ru","longCode":"ru-RU"},
      {"name":"Simple German","code":"de-DE-x-simple-language","longCode":"de-DE-x-simple-language"},
      {"name":"Slovak","code":"sk","longCode":"sk-SK"},
      {"name":"Slovenian","code":"sl","longCode":"sl-SI"},
      {"name":"西班牙语","code":"es","longCode":"es"},
      {"name":"Swedish","code":"sv","longCode":"sv"},
      {"name":"菲律宾语","code":"tl","longCode":"tl-PH"},
      {"name":"Tamil","code":"ta","longCode":"ta-IN"},
      {"name":"乌克兰语","code":"uk","longCode":"uk-UA"}],
    
    selectedLanguage : "auto",
    defaultConvertedText : "Converted text appears here:",
    setLastState : function () {
      try {
        // $("#convertedcode").find('div').append(" ");
        var textCompressed = $("#convertedcode")
          .clone()    //clone the element
          .find('.dropdown-content').remove() //select/remove .dropdown-content
          .end().text();  //go back to selected element

        // console.log('textCompressed', textCompressed)
        
        textCompressed = LZString.compressToEncodedURIComponent(textCompressed);
        var grammarState = {
          lang: $("#langs").val() || 'auto',
          text: textCompressed
        };
        // console.log('grammarState', grammarState)
        localStorage.setItem("grammarChecker", JSON.stringify(grammarState));
      } catch (err) {
        console.log(err);
        $("#langs").val('auto')
        $('#convertedcode').text('');
        app.setLastState();
      }
    },

    getLastState: function () {
      try {
        var grammarState = localStorage.getItem("grammarChecker");
        if (grammarState) {
          grammarState = JSON.parse(grammarState); 
          var textStr = LZString.decompressFromEncodedURIComponent(grammarState.text);
          $('#convertedcode').text(textStr);
          $("#langs").val(grammarState.lang);
        } else if (!$("#langs").val())  {
          $("#langs").val('auto');
        }
        app.setCode();
      } catch (err) {
        console.log(err)
        app.setLastState();
      }
    },

     openInNewTab: function(url) {
      var win = window.open(url, '_blank');
      win.focus();
    },

    setCode : function(mode, ele) {
      if (!_.isUndefined(ele)) {
        this.clearButtons(ele);
      }
      try {
        $('#convertedcode').find('.dropdown-content').remove();  
        var textContent =  $('#convertedcode').text();
        // Trim to a maximum length before sending to the server
        var length = 19900;
        textContent = textContent.substring(0, length);
        // https://stackoverflow.com/questions/36408015/regex-for-adding-a-space-or-period-for-new-sentence-under-certain-conditions
        textContent = textContent.replace(/([^0-9.])\.([^0-9 ])/g, '$1. $2');  // Add space after period if there is none
        //console.log(textContent.replace(/([^0-9.])\.([^0-9 ])/g, '$1. $2'))
        var clean = _.escape(textContent);
        if (clean) {
          $('#convertedcode').html( s.clean(clean) );
        }
        textContent =  $('#convertedcode').text();

        switch(mode) {
          case "grammar":
            //https://languagetool.org/api/v2/check - post!
            var formData = {
              disabledRules: "WHITESPACE_RULE",
              allowIncompleteResults: true,
              text: textContent,
              language: $("#langs").val(),
            };
            if ($("#langs").val() === 'auto') {
              formData.preferredVariants = navigator.language || 'en-US';  //Get from browser lang
            }

            /* var jqxhr = $.get( "https://languagetool.org/api/v2/languages", function(data  ) {
                  console.log( JSON.stringify(data) );
                }, "json")
                  //.done(function() {
                  //console.log( "second success" );
                  //})
                  .fail(function() {
                  console.log( "error" );
                  })
                  //.always(function() {
                  //console.log( "finished" );
                  //});
              */
            
            var jqxhr = $.post( "https://api.languagetoolplus.com/v2/check", formData,  function( data ) {
                //$( ".result" ).html( data );
                //console.log(JSON.stringify( data) );
                /* {
                  "software": {
                    "name": "LanguageTool",
                    "version": "3.9-SNAPSHOT",
                    "buildDate": "2017-09-08 20:01",
                    "apiVersion": 1,
                    "status": ""
                  },
                  "warnings": {
                    "incompleteResults": false
                  },
                  "language": {
                    "name": "English (US)",
                    "code": "en-US"
                  },
                  "matches": [{
                    "message": "Possible typo: you repeated a word",
                    "shortMessage": "Word repetition",
                    "replacements": [{
                      "value": "check"
                    }],
                    "offset": 14,
                    "length": 11,
                    "context": {
                      "text": "ONE TWO THREE check check",
                      "offset": 14,
                      "length": 11
                    },
                    "rule": {
                      "id": "ENGLISH_WORD_REPEAT_RULE",
                      "description": "Word repetition (e.g. 'will will')",
                      "issueType": "duplication",
                      "category": {
                        "id": "MISC",
                        "name": "Miscellaneous"
                      }
                    }
                  }]
                } */

                var $context = $('#convertedcode'),
                  results = [],
                  ranges = [];
                  
                $.each(data.matches, function(key, value) {
                  results.push(value);
                  ranges.push({ start: value.offset, length: value.length });
                });
                
                //If nranges empty then let user know nothing found
                if(_.isEmpty(ranges)) {
                  $(".message").html("我们没有为您找到任何建议。真棒")
                } else {
                  $(".message").html("我们为您找到了一些建议！将鼠标悬停在任何突出显示的短语上，查看潜在错误的详细信息。弹出窗口上的蓝色按钮提供了快速更正错误的方法。如果想重新检查您的更正，请再次单击检查语法按钮。")
                }        
                
                $context.markRanges(ranges, {
                  debug: true,
                  each: function(node, range) {
                    var start = range.start;
                    var found = results.find(function(el) {
                      return el.offset === start;
                      }) || null;
                    if (found) {
                      node.classList.add(found.rule.issueType);
                      
                      var replacements = found.replacements;
                      var replacement = ( !_.isEmpty(replacements) ) ? replacements[0].value : "";
                      
                      var urls = found.rule.urls;
                      var url = ( !_.isEmpty(urls) ) ? urls[0].value : "";
    
                      var dropDownHTML = '<div class="dropdown-content">';
                      dropDownHTML += '	<div class="dropdown-short">' + found.shortMessage + '</div>';
                      dropDownHTML += '	<div class="dropdown-message">' + found.message + '</div>';
                      
                      if (replacement != "") {
                        dropDownHTML += '<div class="dropdown-row"><span class="dropdown-heading replacement">';
                        dropDownHTML += 'Replace with:';
                        for (let index = 0; index < replacements.length; index++) {
                          if (index < replacements.length) {
                            dropDownHTML += '</br>';
                          }
                          dropDownHTML += '</span><span class="btn btn-sm btn-primary replace mb-1">' + replacements[index].value + '</span>'
                        }

                        if (url != "") {
                          dropDownHTML += '<div class="explain-container"><a class="btn btn-sm btn-success explain mb-1" href="' + url + '">Explain this suggestion...</a></div>';
                        }

                        dropDownHTML += '</div>'
                      }
                      dropDownHTML += '<div class="dropdown-footer">&nbsp</div>';
                      
                      dropDownHTML += '  </div>';
                      $(node).append(dropDownHTML);
                      
                      $(node).find('.replace').on("click", function(e){
                        // console.log('Replace....', $(this).text());
                        $(node).text($(this).text())
                        $(node).addClass("fixed")
                        app.setLastState();
                      });

                      $(node).find('.explain').on("click", function(e){
                        // console.log('Explain....', $(this).attr('href'));
                        app.openInNewTab($(this).attr('href'))
                      });
                      
                      $(node).on("mouseenter", function(e){
                        // console.log("scroll");
                        $(this).find(".dropdown-content").scrollintoview();

                        var markLeftPos = $(this).offset().left;
                        // console.log("markLeftPos", markLeftPos);
                        if (markLeftPos > 300) {
                          $(this).find(".dropdown-content").css({
                            "right": 0
                          });
                        } else {
                          $(this).find(".dropdown-content").css({
                            "left": 0
                          });
                        }
                        
                      })
                    }
                  }
                });	
            })
            // .done(function(msg){  })
            .fail(function(xhr, status, error) {
              if ($("#langs").val() === "auto") {
                $(".message").html("Whoops, something didn't work! Try again by selecting a specific language from the dropdown!")
              } else {
                $(".message").html("Were sorry there was an error, and we couldn't check your grammar!")
              }
            });
            break;
          default:
/*               var clean = _.escape(textContent);
              if (clean) {
                $('#convertedcode').html(s.clean(clean));
              } */
            break;
        }
              
        //Set counts
        var regex = /\s+/gi;
        var wordCount = textContent.trim().replace(regex, ' ').split(' ').length;
        var totalChars = textContent.length;
        var charCount = textContent.trim().length;
        var charCountNoSpace = textContent.replace(regex, '').length;
        var charCountClean = s.clean(textContent).length;
        var counts = "<b>Words</b> (space delimited): <span class='countNum'>" + wordCount + "</span>";
        counts += "</br><b>Characters</b>:  <span class='countNum'>" + totalChars+ "</span>";
        // counts += "</br>&nbsp;&mdash;Leading|trailing spaces removed: <span class='countNum'>" + charCount+ "</span>";
        // counts += "</br>&nbsp;&mdash;Leading|trailing|multiple spaces removed: <span class='countNum'>" + charCountClean+ "</span>";
        counts += "</br>&nbsp;&mdash;Without spaces: <span class='countNum'>" + charCountNoSpace+ "</span>";
        
        $('#counts').html( counts );
        
        $('code').each(function(i, block) {
            hljs.highlightBlock(block);
        }); 
        app.setLastState();
      } catch(e) {
        console.log(e)
      }
    },

    copyToClipBoard : function(str, mimetype) {
      document.oncopy = function(event) {
        event.clipboardData.setData(mimetype, str);
        event.preventDefault();
      };
      try {
        var successful = document.execCommand("Copy", false, null);
        var msg = successful ? 'successful' : 'unsuccessful';
        //console.log('Copying text command was ' + msg);
      } catch (err) {
        //console.log('Oops, unable to copy');
      }
    },

    clearButtons: function (activeButton) {
      $("button[data-toggle='button']").not(activeButton).removeClass("active");
      $("button[data-toggle='button']").not(activeButton).addClass("btn-default");
      $("button[data-toggle='button']").not(activeButton).removeClass("btn-info");
      $("button[data-toggle='button']").not(activeButton).attr("aria-pressed", false);
    },

    getQueryParams: function () {
      //Check url location params
      var qs = window.location.search.replace('?','').split('&'),
      qp = {};
      $.each(qs, function(i,v) {
        var initial, pair = v.split('=');
        if(initial = qp[pair[0]]){
          if(!$.isArray(initial)) {
          qp[pair[0]] = [initial]
          }
          qp[pair[0]].push(pair[1]);
        } else {
          qp[pair[0]] = pair[1];
        }
        return;
      });
      return qp;
    }
  };

	// $( document ).ready(function() {
    //Load languages
    _.forEach(app.langs, function(lang) {
      var o = new Option(lang.name, lang.longCode);
      //console.log(lang.name + " : " + lang.longCode)
      $("#langs").append(o);
    });
    
		$('#langs').on("click", function(e) {
      // console.log($(this).val());
		});

		$('#grammar').on("click", function(e) {
			var ele = $(this)
			if ( !ele.hasClass("active") ) {
				app.grammar = true;
				//ele.addClass("btn-info").removeClass("btn-success")
				$("#encodeLabel").html("Your grammar checked here:")
			} else {
				app.grammar = false;
				//ele.addClass("btn-success").removeClass("btn-info")
				$("#encodeLabel").html(app.defaultConvertedText)
			}
			app.setCode( "grammar", $(this) );
		});

		$('#copy').on("click", function(e) {
      var copy = $('#convertedcode').text();
      app.copyToClipBoard(copy, 'text/plain');
    });
    
		$('#clear').on("click", function(e) {
      $('#convertedcode').text('');
      app.setCode();
		})
		$('#convertedcode').on("input", function(e) {
      // console.log('convertedcode')
      app.setLastState();
    });

    var qp = app.getQueryParams();
    var textStr = '';
    if (qp.text) {
      textStr = LZString.decompressFromEncodedURIComponent(qp.text);
      $('#convertedcode').text(textStr);
      $("#langs").val("auto");
      app.setCode();
      window.history.pushState({}, "Grammar Checker", window.location.href.split("?")[0] ); //Object passes state props
      $('#grammar').trigger('click', {});
    } else {
      app.getLastState();
    }
    
	// });
  
  $(".navopentab").on("click", function(e){
    e.preventDefault();
    var link = $(this).attr('href');
    chrome.tabs.create({url:link});
  })

  $(".navopenfullpage").on("click", function(e){
    e.preventDefault();
    var textParam =  $('#convertedcode').text();
    textParamEncoded = LZString.compressToEncodedURIComponent(textParam);
    var params = (textParam && textParamEncoded && '?text=' + textParamEncoded) || '';
    var link = $(this).attr('href') + params;
    chrome.tabs.create({url:link});
  })
	
});
