// Additional JS functions here
var dobAvailbleInFacebook = true;
var me_uid;
var me_name;
var me_sex;
var me_sunsign;
var me_profile_pic;
var res1, res2;
var fb_data = 'not_loaded';
var affinityMap;

var signs2match;
var pair_form_id;
var hello ;
var token ;

var successful_load = 'false' ;

$(document).ready(function() {
	// log.info("document ready");
	window.fbAsyncInit = function() {
		// log.info("inside fbAsyncInit");
		FB.init({
			appId : '159277490876183', // App ID
			channelUrl : 'https://zodiacmeter.appspot.com/channel.html', //
			// Channel
			// File
			// channelUrl : 'http://localhost/channel.html',
			status : true, // check login status
			cookie : true, // enable cookies to allow the server to access the
			// session
			oauth : true, // enable OAuth 2.0
			frictionlessRequests : true,
			useCachedDialogs : true,
			xfbml : true
		// parse XFBML
		});
		
		//console.log("After fbInit");
		fetchFBData();
		//console.log("Fetched FB data");
		initAffinityHash();
		//console.log("After initAffinityHash");
	    setTimeout(function(){
	    	//console.log("load status:" + successful_load);
	    	if ($('#loading').css('display') == 'block') {
	    		if(successful_load == 'false') {
	    			//alert('Something went wrong.reloading page');
	    			window.location.reload(true);
	    		}
	    	}
	    }.bind(this), 5000);
	};
});

function fetchFBData() {
	// log.info("Inside fetchFBData");
	// Additional init code here
	FB
			.getLoginStatus(function(response) {
				if (response.status === 'connected') {
					initProfile();
					if(!dobAvailbleInFacebook) {
						show_dob_error();
					}
					
					FB
							.api(
									{
										method : 'fql.query',
										query : 'SELECT uid, name,birthday_date,birthday,pic_square,sex FROM user WHERE uid IN ( SELECT uid2 FROM friend WHERE uid1 = me()) order by name'
									},

									function(data) {
										fb_data = data;
										if (document.getElementById('loading') == null) {
											// do nothing
										} else {
											document.getElementById('loading').style.display = 'block';
										}

										var res = '';

										res1 = '<select id="friend1" onchange="chooseFriend1(this)" > <option value="-1">Choose Friend </option>';
										res2 = '<select id="friend2" onchange="chooseFriend2(this)" > <option value="-1">Choose Friend </option>';

										for ( var i = 0; i < data.length; i++) {
											var sDate = data[i].birthday_date;

											if (sDate != null) {
												var bday = sDate.split('/');

												var mon = parseInt(bday[0], 10);
												var day = parseInt(bday[1], 10);
												res = res
														+ formFlipCard(data[i],
																mon, day);

												res1 = res1 + '<option value="'
														+ i + '">'
														+ data[i].name
														+ '</option>';
												res2 = res2 + '<option value="'
														+ i + '">'
														+ data[i].name
														+ '</option>';

											}
										}

										res = res + '<div class="clear"></div>';

										res1 = res1 + '</select>';
										res2 = res2 + '</select>';

										if (document
												.getElementById('friendsListHolder') == null) {
											// do
										} else {
											document
													.getElementById('friendsListHolder').innerHTML = res;
										}

										if (document.getElementById('loading') == null) {
											// do nothing
										} else {
											document.getElementById('loading').style.display = 'none';
											successful_load = 'true';
										}

									});
				} else if (response.status === 'not_authorized') {
					// not_authorized
					login();
				} else {
					// not_logged_in
					login();
				}
			});
}

function login() {
	FB.login(function(response) {
		if (response.authResponse) {
			window.location = 'home.html';
		} else {
			// cancelled
		}
	}, {
		scope : 'user_birthday,friends_birthday,publish_stream'
	});
}

function formFlipCard(friend, mon, day) {
	var zodiacSign = sunsign(mon, day);
	var signSymbol = sunsignSymbol(zodiacSign);
	var uid = friend.uid;

	var sDiv = '<form name="f_'
			+ uid
			+ '" action="/affinity_match" method="post">'
			+ '<div class="box" id="'
			+ uid
			+ '">'
			+ '<div style="padding: 10px 10px 10px 10px;">'
			+ '<img id="friend" src="'
			+ friend.pic_square
			+ '">'
			+ '<a class="button coolblue medium" title="Compatibility between you & friend" data-reveal-id="match_report" onclick="javascript:submitForm('
			+ uid
			+ ')">Check Affinity</a>'
			+ '<a class="button orange small" title="You can Badge on the qualities of this friend" id="endorse_friend_'+uid +'" data-reveal-id="endorse_friend" onclick="javascript:endorse_friend('
			+ uid
			+ ')">Badge '+ get_gender(friend.sex) +'</a>' 
			+ '</div>'
			+ '<div class="inner-content">'
			+ '<div style="height:45px;">'
			+ '<h2 style="font-family: calibri; font-size: 14px; font-weight: bold; color :#222222">'
			+ friend.name
			+ '</h2>'
			+ '<div id="badges_for_friend" title="Click to see the number of badges received by this friend" style="margin-top:-5px;float:right;cursor:pointer;" onclick="javascript:show_badges_for_friend('
			+ uid
			+ ')">' 
			+ '<img style="height:40px;" src="/images/endorse.png">'
			+ '</div>'
			+ '</div>'
			+ '<div id="sign_thumb" title="Click to view the traits" style="float:left;height:130;width:130;margin-left:-10px;margin-top:-10px">'
			+ '<img style="cursor:pointer" src="images/thumbnails/' + zodiacSign + '.png" onclick="javascript:popup_sign_card('+ uid +')"/>'
			+ '</div>' + '<div title="Your compatibility score with this friend" id="tv">'
			+ affinityScore(me_sunsign, zodiacSign) + '</div>' + '</div>'
			+ '</div>';
	sDiv = sDiv + '<input type="hidden" name="uid1" value="' + me_uid + '">'
			+ '<input type="hidden" name="name1" value="' + me_name + '">'
			+ '<input type="hidden" name="me_sex" value="' + me_sex + '">'
			+ '<input type="hidden" name="friend_sex" value="' + friend.sex
			+ '">' + '<input type="hidden" name="pic1" value="'
			+ me_profile_pic + '">'
			+ '<input type="hidden" name="sign1" value="' + me_sunsign + '">'
			+ '<input type="hidden" name="uid2" value="' + uid + '">'
			+ '<input type="hidden" name="name2" value="' + friend.name + '">'
			+ '<input type="hidden" name="pic2" value="' + friend.pic_square
			+ '">' + '<input type="hidden" name="sign2" value="' + zodiacSign
			+ '">' + '</form>';

	return sDiv;
}

function popup_sign_card(uid){
	var formid = "f_" + uid ;
	var sign = document.forms[formid].sign2.value;
	var cardDiv = sign+"_card" ;
	var cardHolder = document.getElementById('sunsign_card_content');
	cardHolder.innerHTML =  document.getElementById(''+ cardDiv +'').innerHTML;
	
	var elem2 = document.getElementById('sunsign_card_open');
	fireClick(elem2); 
}

function show_badges_for_friend(uid){
	
	$("#badge_loading").show();
	var elem = document.getElementById('badges_for_friend_open');
	fireClick(elem);

	$.ajax({
		type : "POST",
		url : "/badges_for_friend",
		cache : false,
		data : "friend_uid=" + uid,

		success : function(response) {
			$("#badge_loading").hide();
			document.getElementById("badges_content").innerHTML = response;
		},

		error: function(jqXHR, exception) {
            //showAjaxErrors(jqXHR, exception);
			$("#badge_loading").hide();
        }	
	});
	
}

function endorse_back(uid) {
	var elem = document.getElementById('endorse_badge_close');
	fireClick(elem);
	endorse_friend(uid);
}

var endorse_box_dirty = 'false' ;

function endorse_friend(uid) {
	$("#endorse_error_holder").hide();
	$("#endorse_history_holder").hide();
	$("#endorse_orange_button").show();
	$("#traits_list").show();
	endorse_box_dirty = 'false';
	
	var formid = 'f_' + uid;
	var sign_traits_div = "common_endorsement_traits"; //document.forms[formid].sign2.value + "_"
	var traitsHtml = document.getElementById('' + sign_traits_div + '').innerHTML;
	$("#traits_box").empty();
	$("#endorse_box").find("li").remove();

	document.getElementById('endorse_form_id').innerHTML = formid;

	document.getElementById('traits_box').innerHTML = traitsHtml;

	var divHtml = document.getElementById('endorse_friend').innerHTML;

	$("#endorse_friend_photo").attr("src", document.forms[formid].pic2.value);
	$("#endorse_friend_name").text(document.forms[formid].name2.value);
	$("#endorse_friend_sign").text(document.forms[formid].sign2.value);
	drag_drop();
	populate_endorsed_traits(uid);
	hide_endorse_button_if_necessary();
}

function hide_endorse_button_if_necessary(){
	var count = $('#traits_box').find("li").length;
	if(count == 0) {
		$('#endorse_orange_button').hide();
		$('#traits_list').hide();
	}
}
	
function populate_endorsed_traits(uid) {
	//Check if this person has been endorsed by you already , then move the traits to endorse box and freeze
	var checkForDivId = 'endorse_badge_for_' + uid ;
	var alreadyEndorsed = document.getElementById(checkForDivId);

	if(alreadyEndorsed != null) {
		var traits_list = 'endorsed_traits_for_' + uid ;
		
		$("#" + traits_list + "> span").each(
			function(index, element) {
				var endorsed_trait = $(element).text();
				
				$("ul.traits_box > li").each(
					function(index, element) {
						var available_trait = $(element).text();
						if(available_trait == endorsed_trait) {
							var $endorse_box = $("#endorse_box");
							var $list = $("ul", $endorse_box).length ? $("ul", $endorse_box)
									: $("<ul class='traits_box ui-helper-reset'/>").appendTo(
											$endorse_box);
							$(element).find("a.ui-icon-refresh").remove(); 
							$(element).appendTo($list);
							$(element).draggable( 'disable');
							$(element).attr('freeze' ,'true');
						}
					}
				);
			}	
		);
 	}
}

function makePost(endorsedBy, endorsementFor) {
	$.ajax({
		type : "POST",
		url : "/hello",
		cache : false,
		data : "token=" + token,

		success : function(response) {
			var address = "https://graph.facebook.com/" + endorsementFor
			+ "/notifications";
			var tempdata = {};
			
			tempdata['access_token'] = '159277490876183' + "|"
					+ response ;
			tempdata['href'] = "";
			tempdata['template'] = "Congratulations! You have been endorsed by "
					+ endorsedBy + " in Affinity.";
			jQuery.post(address, tempdata, function(data) {
				// console.log(data);
			});
			//publishFeed(' has endorsed friend in Affinity');
		},

		error: function(jqXHR, exception) {
            //showAjaxErrors(jqXHR, exception);
        }	
	});
}

function save_endorsement() {
	var formid = document.getElementById('endorse_form_id').innerHTML;
	var friend_uid = document.forms[formid].uid2.value;
	var character_id = '';

	$('#endorse_box li').each(
			function(index,item) {
				character_id = $(item).find('span').text();
				
				var is_frozen = $(item).attr("freeze");
				if('true' != is_frozen) {
					endorse_box_dirty = 'true' ; //GLOBAL VARIABLE
					character_id  = decodeURIComponent(character_id) ;
					add_to_endorsed_list(document.forms[0].uid1.value , friend_uid ,character_id );
					$.ajax({
						type : "POST",
						url : "/endorse",
						cache : false,
						data : "endorsementFor=" + friend_uid + "&"
								+ "characterId=" + decodeURIComponent(character_id)
								+ "&" + "me_uid=" + document.forms[0].uid1.value
								+ "&" + "me_name=" + document.forms[0].name1.value
								+ "&" + "endorsementForName=" + document.forms[formid].name2.value
								+ "&" + "token=" + token,
	
						success : function(response) {
							//alert(response); 
							if (response == 'ENDORSEMENT_SUCCESS') {
								// DO_NOTHING;
							}
						},
	
						/* Setup the call */
						xhrFields : {
							withCredentials : true
						}
				    });
				}
	});

	if(endorse_box_dirty == 'false' ) {
		$('#endorse_error_holder').empty();
		$('#endorse_error_holder').html("Please choose a trait to endorse");
		$('#endorse_error_holder').show();
		return ;
	} else {
		var elem = document.getElementById('endorse_form_close');
		fireClick(elem);
		alert('Successfully Badged.')
	}

	$('#endorse_orange_button').show();

	makePost( document.forms[0].name1.value , friend_uid);
}

function add_to_endorsed_list(me_uid, friend_uid,character) {
	var checkForDivId = 'endorse_badge_for_' + friend_uid ;
	var alreadyEndorsed = document.getElementById(checkForDivId);
	var traitsDivId = 'endorsed_traits_for_' + friend_uid ;

	if(alreadyEndorsed != null) {
		var html = '<span>' + character + '</span>' ;
		
		$("#" + traitsDivId).append(html);
	} else {
		var html = '<div id="' + checkForDivId + '">';
		html = html + '<div id="' + traitsDivId + '">' ;
		html = html + '<span>' + character + '</span>' ;
		html = html + '</div>' ;
		html = html + '</div>' ;
		$("#endorsements_from_me").append(html);
	}
}

// Endorsements

function drag_drop() {
	// there's the traits_box and the endorse_box
	var $traits_box = $("#traits_box"), $endorse_box = $("#endorse_box");

	// let the traits_box items be draggable
	$("li", $traits_box).draggable({
		cancel : "a.ui-icon", // clicking an icon won't initiate dragging
		revert : "invalid", // when not dropped, the item will revert back to
							// its initial position
		containment : "document",
		helper : "clone",
		cursor : "pointer"
	});

	// let the endorse_box be droppable, accepting the traits_box items
	$endorse_box.droppable({
		accept : "#traits_box > li",
		activeClass : "ui-state-highlight",
		drop : function(event, ui) {
			endorse(ui.draggable);
		}
	});

	// let the traits_box be droppable as well, accepting items from the
	// endorse_box
	$traits_box.droppable({
		accept : "#endorse_box li",
		activeClass : "custom-state-active",
		drop : function(event, ui) {
			undoEndorse(ui.draggable);
		}
	});

	// image deletion function
	var undo_endorse_icon = "<a href='link/to/recycle/script/when/we/have/js/off' title='Undo Endorsement' class='ui-icon ui-icon-refresh'>Undo Endorsement</a>";
	function endorse($item) {
		$item.fadeOut(function() {
			var $list = $("ul", $endorse_box).length ? $("ul", $endorse_box)
					: $("<ul class='traits_box ui-helper-reset'/>").appendTo(
							$endorse_box);

			$item.find("a.ui-icon-refresh").remove(); // to avoid double click
														// adding two icons

			$item.append(undo_endorse_icon).appendTo($list).fadeIn(function() {
				$item.animate({
					width : "160px"
				});
				$item.find('img').attr("id", "undo_endorse");

			});
		});
	}

	function undoEndorse($item) {
		$item.fadeOut(function() {
			$item.find("a.ui-icon-refresh").remove().end()
					.css("width", "160px").find("img").end().appendTo(
							$traits_box).fadeIn();
			$item.find('img').attr("id", "endorse");
		});
	}

	// resolve the icons behavior with event delegation
	$("ul.traits_box > li").click(function(event) {
		var $item = $(this);

		var targetid = $item.find('img').attr("id");
		
		var is_frozen = $item.attr("freeze");
		
		if(is_frozen == 'true') return ;
		
		var count = $('#endorse_box').find("li").length;

		if (targetid == "endorse") {
			if(count < 10) {
				endorse($item);
			} else {
				$('#endorse_error_holder').empty();
				$('#endorse_error_holder').html("You can Badge a maximum of 10 qualities");
				$('#endorse_error_holder').show();
			}
		} else {
			undoEndorse($item);
		}

		return false;
	});
}

function show_dob_error()
{
	var elem = document.getElementById('dob_error_open');
	fireClick(elem);
}

function submitForm(uid) {
	if (!dobAvailbleInFacebook) {
		show_dob_error();
		return;
	}
	
	var formid = 'f_' + uid;

	var sign1 = document.forms[formid].sign1.value;
	var sign2 = document.forms[formid].sign2.value;

	signs2match = [ sign1, sign2 ];
	signs2match.sort();

	var affinity_div = signs2match[0] + "_" + signs2match[1] + "_1";
	var divHtml = document.getElementById('' + affinity_div + '').innerHTML;

	$("#person1_photo").attr("src", document.forms[formid].pic1.value);
	$("#person1_name").text(document.forms[formid].name1.value);
	$("#person1_sign").text(document.forms[formid].sign1.value);

	$("#person2_photo").attr("src", document.forms[formid].pic2.value);
	$("#person2_name").text(document.forms[formid].name2.value);
	$("#person2_sign").text(document.forms[formid].sign2.value);

	$("#compatibility").text(affinityScore(signs2match[0], signs2match[1]));

	var scorehtml = document.getElementById('pair').innerHTML;
	
	$("#endorse_match_friend").show();
		
	$('#endorse_match_friend').text("Badge "+ document.forms[formid].name2.value);
	$('#endorse_match_friend').attr("onclick" , "javascript:endorse_match(" + uid + ")");
	
	$(".flipbox").flippy({
		color_target : "#FFFFFF",
		direction : "bottom",
		duration : "750",
		verso : scorehtml,
	});

	$("#btn0").css({
		"background" : "red"
	});
	$("#btn1").css({
		"background" : "#075698"
	});
	$("#btn2").css({
		"background" : "#075698"
	});
	$("#btn3").css({
		"background" : "#075698"
	});
	$("#btn4").css({
		"background" : "#075698"
	});
	$("#btn5").css({
		"background" : "#075698"
	});
	
	//publishFeed(' is using Affinity');
}

function endorse_match(uid)
{
	var elem = document.getElementById('close_affinity_report');
	fireClick(elem);
	
	var elem2 = document.getElementById('endorse_friend_' + uid);
	fireClick(elem2);
}

function initProfile() {
	FB
			.api(
					{
						method : 'fql.query',
						query : 'SELECT uid, name,sex,birthday_date,birthday,pic_square FROM user WHERE uid = me()'
					},

					function(data) {
						// do something with the response
						window.me_profile_pic = data[0].pic_square;
						window.me_uid = data[0].uid;
						window.me_name = data[0].name;
						window.me_sex = data[0].sex;

						var sDate = data[0].birthday_date;
						if (sDate != null) {
							var bday = sDate.split('/');
							var mon = parseInt(bday[0], 10);
							var day = parseInt(bday[1], 10);
							window.me_sunsign = sunsign(mon, day);
						} else {
							dobAvailbleInFacebook = false;
						}

						register(data[0].uid, data[0].name);
						
						setProfileHtml('profile');
						
						if (dobAvailbleInFacebook) {
							load_sign_info(me_profile_pic, me_name, me_sunsign);							
						}

					});
}

function read_endorsements_from(uid) {
	$
			.ajax({
				type : "POST",
				url : "/endorsements_from_me",
				cache : false,
				data : "token=" + token,

				success : function(response) {
					$('#endorsed_by_me').html(response);
				},

				xhrFields : {
					withCredentials : true
				},

				error: function(jqXHR, exception) {
					//showAjaxErrors(jqXHR, exception);
		        }				
				
			});
}

function showAjaxErrors(jqXHR, exception) {
    if (jqXHR.status === 0) {
        alert('Not connected.Verify Network.');
    } else if (jqXHR.status == 404) {
        alert('Requested page not found. [404]');
    } else if (jqXHR.status == 500) {
        alert('Internal Server Error [500].');
    } else if (exception === 'parsererror') {
        alert('Requested JSON parse failed.');
    } else if (exception === 'timeout') {
        alert('Time out error.');
    } else if (exception === 'abort') {
        alert('Ajax request aborted.');
    } else {
        alert('read_new_endorsements:' + jqXHR.responseText);
    }
}

function read_new_endorsements(uid) {
	$
			.ajax({
				type : "POST",
				url : "/new_endorsements",
				cache : false,
				data : "token=" + token,

				success : function(response) {
					document.getElementById('endorsement_data').innerHTML = response;
					var count = $("#endorsementsFor > div").length;
					if (count > 0) {
						$('a#count').text(count);
						$('#notifications').show();
						var height = count * 50 + 50 ;
						if(count <=5) {
							$('#whatsup').attr("height" , height + "px" );
						} else {
							$('#whatsup').attr("height" , "400px" );
						}
					}

					var html = '<div>';
					$("#endorsementsFor > div")
							.each(
									function(index, element) {
										var endorsedBy = $(
												"#endorsedByName_" + index)
												.text();
										var endorsedById = $(
												"#endorsedById_" + index)
												.text();
										var formid = 'f_' + endorsedById;
										var profile_pic = document.forms[''
												+ formid + ''].pic2.value;
										var data_reveal_id = 'endorse_badge_from_'
												+ endorsedById;

										html = html
												+ '<div style="cursor:pointer;height:50px;padding:2px;" onclick="javascript:show_endorsement('
												+ $("#endorsedById_" + index)
														.text()
												+ ')">'
												+ '<div style="float:left">'
												+ '<img src="'
												+ profile_pic
												+ '">'
												+ '<img src="https://zodiacmeter.appspot.com/images/endorse.png">'
												+ '</div>'
												+ '<div id="endorsement_notification">'
												+ '<a style="left:-10px;color:rgb(184, 127, 9);font-weight: bold;font-family: calibri;cursor: pointer;">'
												+ endorsedBy
												+ ' has badged your traits</a>'
												+ '</div></div>';
									});

					html = html + '</div>';

					document.getElementById('whatsup').innerHTML = html;
					
				},
				/* Setup the call */
				xhrFields : {
					withCredentials : true
				},

				error: function(jqXHR, exception) {
					//showAjaxErrors(jqXHR, exception);
		        }				
				
			});
}

function show_endorsement(id) {
	var formid = 'f_' + id;
	var profile_pic = document.forms['' + formid + ''].pic2.value;

	var elem = document.getElementById('close_notifications');
	fireClick(elem);
	
	var elem2 = $('#endorse_badge_from_' + id);
	$('#endorsed_by_profile_pic').attr('src', profile_pic);
	
	document.getElementById('endorsement_badge_show').innerHTML = $(elem2).html();
	
	$('#endorse_back_orange_button').attr("onclick", "javascript:endorse_back(" + id + ")")

	var elem3 = document.getElementById('endorse_badge_open');
	fireClick(elem3);
}

function register(me_uid, me_name) {
	$.ajax({
		type : "POST",
		url : "/register",
		cache : false,
		data : "me_uid=" + me_uid + "&me_name=" + me_name ,

		success : function(response) {
			token = response ;
			read_new_endorsements(me_uid);
			read_endorsements_from(me_uid);
		},

		error: function(jqXHR, exception) {
			//showAjaxErrors(jqXHR, exception);
        }		
	});
}

function logout(){
	
	$.ajax({
		type : "POST",
		url : "/logout",
		cache : false,
		data : "me_uid=" + me_uid ,

		success : function(response) {
			FB.logout(function(response) {
				  // user is now logged out
				window.location = 'index.html';
			});
		},

		error: function(jqXHR, exception) {
			//showAjaxErrors(jqXHR, exception);
			window.location = 'index.html';
			//FB.Auth.setAuthResponse(null, 'unknown');
        }		
	});

	
	
}


function load_sign_info(me_profile_pic, me_name, me_sunsign) {
	// log.info("before poup");
	$('#me_photo').attr("src", me_profile_pic);
	$('#me_name').text(me_name);
	$('#me_sunsign').text(me_sunsign);
	var logo = 'images/thumbnails/' + me_sunsign + '.png';
	$('#me_sign_logo').attr("src", logo);

	var signInfo = document.getElementById('' + me_sunsign + '').innerHTML;
	$('#sunsign_info').html(signInfo);

	// log.info("end of page document ready");
	var elem = document.getElementById('yoursigninfo');
	fireClick(elem);

	// log.info("after poup");
}

function setProfileHtml(divname) {
	if (!dobAvailbleInFacebook) {
		me_sunsign = 'Unknown';
	}

	var html = '<div style="float: right; width:80px;">'
			+ '<img id="me" src="'
			+ me_profile_pic
			+ '"'
			+ '>'
			+ '<label style="font-family: Calibri; font-size: 18px; font-weight: bold; color: #404040;text-align:center">'
			+ me_sunsign + '</label>'
			+ '<div id="logout" style="float:right;">'
			+ '<img style="cursor:pointer;" title="Logout" src="images/logout.png" onclick="javascript:logout();">'
			+ '</div></div>' ; 

	if (document.getElementById('' + divname + '') != null) {
		document.getElementById('' + divname + '').innerHTML = html;
	}
}

function publishFeed(msg) {
	FB.api('/me/feed', 'post', {
		message : msg
	}, function(response) {
		if (!response || response.error) {
			//alert('Unexpected error occured');
		}
	});
}

// Send a request to friends have have logged into the app in the past, as well
// as friends that haven't
function sendRequestBoth() {
	FB.ui({
		method : 'apprequests',
		message : 'Try using Affinity to check compatibility between you & your facebook friends',
	}, function(response) {
		// console.log('sendRequestBoth response: ', response);
	});
}

// Send an invite to friends that haven't logged into the app yet
function sendRequestInvite() {
	FB.ui({
		method : 'apprequests',
		message : 'Try using Affinity to check compatibility between you & your facebook friends',
	}, function(response) {
		// console.log('sendRequestBoth response: ', response);
	});
}

function chooseFriend1(sel) {
	var value = sel.options[sel.selectedIndex].value;
	var html = '<img id="pic1" align="center" src="'
			+ fb_data[value].pic_square + '"' + '>';
	document.getElementById('friend_pic1').innerHTML = html;

	document.forms[0].uid1.value = fb_data[value].uid;
	document.forms[0].name1.value = fb_data[value].name;
	document.forms[0].pic1.value = fb_data[value].pic_square;
	document.forms[0].friend_sex.value = fb_data[value].sex;

	document.forms[0].sign1.value = sunsign2(fb_data[value].birthday_date);
	
	$('#affinity_check_error_holder').hide();
}

function chooseFriend2(sel2) {
	var value = sel2.options[sel2.selectedIndex].value;
	var html = '<img id="pic2" align="center" src="'
			+ fb_data[value].pic_square + '"' + '>';
	document.getElementById('friend_pic2').innerHTML = html;

	document.forms[0].uid2.value = fb_data[value].uid;
	document.forms[0].name2.value = fb_data[value].name;
	document.forms[0].pic2.value = fb_data[value].pic_square;

	document.forms[0].friend_sex.value = fb_data[value].sex;

	document.forms[0].sign2.value = sunsign2(fb_data[value].birthday_date);
	$('#affinity_check_error_holder').hide();
}

function validateSubmit() {
	var index1 = document.getElementById('friend1').selectedIndex;
	var index2 = document.getElementById('friend2').selectedIndex;
	
	if(index1 == 0|| index2 == 0) {
		$('#affinity_check_error_holder').html('Choose two friends to check affinity');
		$('#affinity_check_error_holder').show();
		return ;
	}
	
	if(index1 == 0 && index2 == 0) {
		$('#affinity_check_error_holder').html('Choose two friends to check affinity');
		$('#affinity_check_error_holder').show();
		return ;
	}
	
	if (document.forms[0].uid1.value == document.forms[0].uid2.value) {
		$('#affinity_check_error_holder').html('Choose two friends to check affinity');
		$('#affinity_check_error_holder').show();
		return ;
	}

	var sign1 = document.forms[0].sign1.value;
	var sign2 = document.forms[0].sign2.value;

	signs2match = [ sign1, sign2 ];
	signs2match.sort();

	$('#affinity_check_popup').hide();

	signs2match = [ sign1, sign2 ];
	signs2match.sort();

	$("#person1_photo").attr("src", document.forms[0].pic1.value);
	$("#person1_name").text(document.forms[0].name1.value);
	$("#person1_sign").text(document.forms[0].sign1.value);

	$("#person2_photo").attr("src", document.forms[0].pic2.value);
	$("#person2_name").text(document.forms[0].name2.value);
	$("#person2_sign").text(document.forms[0].sign2.value);

	$("#compatibility").text(affinityScore(signs2match[0], signs2match[1]));
	$("#endorse_match_friend").hide();
	var scorehtml = document.getElementById('pair').innerHTML;

	$(".flipbox").flippy({
		color_target : "#FFFFFF",
		direction : "bottom",
		duration : "750",
		verso : scorehtml,
	});

	$("#btn0").css({
		"background" : "red"
	});
	$("#btn1").css({
		"background" : "#075698"
	});
	$("#btn2").css({
		"background" : "#075698"
	});
	$("#btn3").css({
		"background" : "#075698"
	});
	$("#btn4").css({
		"background" : "#075698"
	});
	$("#btn5").css({
		"background" : "#075698"
	});

	// document.forms[0].submit();
	var elem = document.getElementById('friend_affinity_inv');
	fireClick(elem);
}


// /////////////////////////////////////////////////////////////////////////
// sunsigns
// /////////////////////////////////////////////////////////////////////////
function sunsignSymbol(sunsign) {
	var signs = [ 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer',
			'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn' ];
	var symbols = [ 'Water bearer', 'Fish', 'Ram', 'Bull', 'Twins', 'Crab',
			'Lion', 'Virgin', 'Scales', 'Scorpion', 'Archer', 'Goat' ];
	for ( var i = 0; i < signs.length; i++) {
		if (sunsign == signs[i]) {
			return symbols[i];
		}
	}
	return 'Unknown';
}

function birthdaySign(m, d) {
	m -= 1;
	var sign, zodiac = [ [ 20, 'Aquarius', 'water bearer' ],
			[ 19, 'Pisces', 'fish' ], [ 21, 'Aries', 'ram' ],
			[ 20, 'Taurus', 'bull' ], [ 21, 'Gemini', 'twins' ],
			[ 22, 'Cancer', 'crab' ], [ 23, 'Leo', 'lion' ],
			[ 23, 'Virgo', 'virgin' ], [ 23, 'Libra', 'scales' ],
			[ 23, 'Scorpio', 'scorpion' ], [ 22, 'Sagittarius', 'archer' ],
			[ 22, 'Capricorn', 'goat' ] ];
	if (m == 0 && d < 20)
		return zodiac[11].slice(1);
	else
		sign = zodiac[m];
	if (d < sign[0])
		sign = zodiac[m - 1];
	return sign.slice(1);
}

function birthdaySign2(m, d) {
	m -= 1;
	var sign, zodiac = [ [ 20, 'Aquarius' ], [ 19, 'Pisces' ], [ 21, 'Aries' ],
			[ 20, 'Taurus' ], [ 21, 'Gemini' ], [ 22, 'Cancer' ],
			[ 23, 'Leo' ], [ 23, 'Virgo' ], [ 23, 'Libra' ], [ 23, 'Scorpio' ],
			[ 22, 'Sagittarius' ], [ 22, 'Capricorn' ] ];
	if (m == 0 && d < 20)
		return zodiac[11].slice(1);
	else
		sign = zodiac[m];
	if (d < sign[0])
		sign = zodiac[m - 1];
	return sign.slice(1);
}

function sunsign(m, d) {
	m -= 1;
	var sign = '';
	var day = [ 20, 19, 21, 20, 21, 22, 23, 23, 23, 23, 22, 22 ];
	var zodiac = [ 'Aquarius', 'Pisces', 'Aries', 'Taurus', 'Gemini', 'Cancer',
			'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn' ];

	if (m == 0 && (d < day[m])) {
		sign = zodiac[11];
	} else {
		sign = zodiac[m];
		if (d < day[m])
			sign = zodiac[m - 1];
	}

	return sign;
}

function sunsign2(sDate) {
	if (sDate != null) {
		var bday = sDate.split('/');

		var mon = parseInt(bday[0], 10);
		var day = parseInt(bday[1], 10);
	}
	var zodiacSign = sunsign(mon, day);
	return zodiacSign;
}

function get_gender(sex){
	var noun = 'Her' ;
	
	if (sex == 'male') {
		noun = 'Him';
	}
	
	return noun;
}

function share() {
	var elem = document.getElementById('aboutyouclose');
	fireClick(elem);

	var sex = 'her';
	var sign = document.forms[0].sign1.value;
	var traitsdiv = sign + "_Traits";
	var traits = document.getElementById('' + traitsdiv + '').innerHTML;
	if (document.forms[0].me_sex.value == 'male') {
		sex = 'his';
	}

	var wallPost = {
		message : document.forms[0].name1.value
				+ " agrees with the Affinity prediction of " + sex + " traits",
		caption : "Affinity can predict your traits and check compatibility with friends",
		picture : "https://zodiacmeter.appspot.com/images/thumbnails/" + sign
				+ ".png",
		description : "I'm proud to be a " + sign + ".Affinity says "
				+ document.forms[0].name1.value + " is " + traits,
		link : "https://apps.facebook.com/zodiacaffinity/",
	};
	FB.api('/me/feed', 'post', wallPost, function(response) {
		if (!response || response.error) {
			// alert('Error occured');
		} else {
			//alert('Shared this to your wall ');
		}
	});
}

function initAffinityHash() {
	affinityMap = new Hashtable();

	affinityMap.put("Aquarius_Aquarius", "90%");
	affinityMap.put("Aquarius_Pisces", "65%");
	affinityMap.put("Aquarius_Aries", "80%");
	affinityMap.put("Aquarius_Taurus", "65%");
	affinityMap.put("Aquarius_Gemini", "85%");
	affinityMap.put("Aquarius_Cancer", "70%");
	affinityMap.put("Aquarius_Leo", "70%");
	affinityMap.put("Aquarius_Virgo", "70%");
	affinityMap.put("Aquarius_Libra", "80%");
	affinityMap.put("Aquarius_Scorpio", "55%");
	affinityMap.put("Aquarius_Sagittarius", "85%");
	affinityMap.put("Aquarius_Capricorn", "70%");

	affinityMap.put("Pisces_Pisces", "95%");
	affinityMap.put("Aries_Pisces", "60%");
	affinityMap.put("Pisces_Taurus", "80%");
	affinityMap.put("Gemini_Pisces", "45%");
	affinityMap.put("Cancer_Pisces", "80%");
	affinityMap.put("Leo_Pisces", "60%");
	affinityMap.put("Pisces_Virgo", "75%");
	affinityMap.put("Libra_Pisces", "60%");
	affinityMap.put("Pisces_Scorpio", "90%");
	affinityMap.put("Pisces_Sagittarius", "65%");
	affinityMap.put("Capricorn_Pisces", "70%");

	affinityMap.put("Aries_Aries", "65%");
	affinityMap.put("Aries_Taurus", "55%");
	affinityMap.put("Aries_Gemini", "80%");
	affinityMap.put("Aries_Cancer", "65%");
	affinityMap.put("Aries_Leo", "85%");
	affinityMap.put("Aries_Virgo", "70%");
	affinityMap.put("Aries_Libra", "75%");
	affinityMap.put("Aries_Scorpio", "60%");
	affinityMap.put("Aries_Sagittarius", "95%");
	affinityMap.put("Aries_Capricorn", "45%");

	affinityMap.put("Taurus_Taurus", "85%");
	affinityMap.put("Gemini_Taurus", "55%");
	affinityMap.put("Cancer_Taurus", "95%");
	affinityMap.put("Leo_Taurus", "60%");
	affinityMap.put("Taurus_Virgo", "85%");
	affinityMap.put("Libra_Taurus", "75%");
	affinityMap.put("Scorpio_Taurus", "80%");
	affinityMap.put("Sagittarius_Taurus", "50%");
	affinityMap.put("Capricorn_Taurus", "85%");

	affinityMap.put("Gemini_Gemini", "70%");
	affinityMap.put("Cancer_Gemini", "65%");
	affinityMap.put("Gemini_Leo", "75%");
	affinityMap.put("Gemini_Virgo", "65%");
	affinityMap.put("Gemini_Libra", "85%");
	affinityMap.put("Gemini_Scorpio", "70%");
	affinityMap.put("Gemini_Sagittarius", "85%");
	affinityMap.put("Capricorn_Gemini", "55%");

	affinityMap.put("Cancer_Cancer", "90%");
	affinityMap.put("Cancer_Leo", "75%");
	affinityMap.put("Cancer_Virgo", "85%");
	affinityMap.put("Cancer_Libra", "70%");
	affinityMap.put("Cancer_Scorpio", "90%");
	affinityMap.put("Cancer_Sagittarius", "70%");
	affinityMap.put("Cancer_Capricorn", "85%");

	affinityMap.put("Leo_Leo", "85%");
	affinityMap.put("Leo_Virgo", "70%");
	affinityMap.put("Leo_Libra", "80%");
	affinityMap.put("Leo_Scorpio", "50%");
	affinityMap.put("Leo_Sagittarius", "90%");
	affinityMap.put("Capricorn_Leo", "55%");

	affinityMap.put("Virgo_Virgo", "90%");
	affinityMap.put("Libra_Virgo", "70%");
	affinityMap.put("Scorpio_Virgo", "80%");
	affinityMap.put("Sagittarius_Virgo", "65%");
	affinityMap.put("Capricorn_Virgo", "90%");

	affinityMap.put("Libra_Libra", "90%");
	affinityMap.put("Libra_Scorpio", "75%");
	affinityMap.put("Libra_Sagittarius", "85%");
	affinityMap.put("Capricorn_Libra", "70%");

	affinityMap.put("Scorpio_Scorpio", "80%");
	affinityMap.put("Sagittarius_Scorpio", "65%");
	affinityMap.put("Capricorn_Scorpio", "75%");

	affinityMap.put("Sagittarius_Sagittarius", "85%");
	affinityMap.put("Capricorn_Sagittarius", "60%");

	affinityMap.put("Capricorn_Capricorn", "85%");
}

function affinityScore(sign1, sign2) {
	var score = [ sign1, sign2 ];
	score.sort();
	var scoreKey = score[0] + "_" + score[1];
	var aff_score = affinityMap.get(scoreKey);
	
	if(aff_score == null) {
		return 'NA' ;
	}
	return aff_score;
}
