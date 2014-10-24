// Additional JS functions here
var dobAvailbleInFacebook = true;
var me_uid;
var me_name;
var me_sunsign;
var me_profile_pic;

window.fbAsyncInit = function() {
	FB.init({
		appId : '159277490876183', // App ID
		channelUrl : 'http://zodiacmeter.appspot.com/channel.html', //
		// Channel
		// File
		//channelUrl : 'http://localhost/channel.html',
		status : true, // check login status
		cookie : true, // enable cookies to allow the server to access the
		// session
		oauth : true, // enable OAuth 2.0
		frictionlessRequests : true,
		useCachedDialogs : true,
		xfbml : true
	// parse XFBML
	});

	// Additional init code here
	FB
			.getLoginStatus(function(response) {
				if (response.status === 'connected') {
					
					initProfile();
					
					if (!dobAvailbleInFacebook) {
						alert('Please update your date of birth in facebook.This is needed for compatibility check with your friends.');
					}

					FB
							.api(
									{
										method : 'fql.query',
										query : 'SELECT uid, name,birthday_date,birthday,pic_square FROM user WHERE uid IN ( SELECT uid2 FROM friend WHERE uid1 = me()) order by name'
									},

									function(data) {
										// do something with the response
										document
										.getElementById('loading').style.display = 'block';

										var res = '';
										for ( var i = 0; i < data.length; i++) {
											var sDate = data[i].birthday_date;

											if (sDate != null) {
												var bday = sDate.split('/');

												var mon = parseInt(bday[0], 10);
												var day = parseInt(bday[1], 10);
												res = res
														+ formFlipCard(data[i],
																mon, day);
											}
										}
										res = res + '<div class="clear"></div>';
										document
												.getElementById('friendsListHolder').innerHTML = res;
										document
										.getElementById('loading').style.display = 'none';
									});
				} else if (response.status === 'not_authorized') {
					// not_authorized
					login();
				} else {
					// not_logged_in
					login();
				}
			});
			
	
};

// Load the SDK Asynchronously
(function(d) {
	var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
	if (d.getElementById(id)) {
		return;
	}
	js = d.createElement('script');
	js.id = id;
	js.async = true;
	js.src = "//connect.facebook.net/en_US/all.js";
	ref.parentNode.insertBefore(js, ref);
}(document));

function login() {
	FB.login(function(response) {
		if (response.authResponse) {
			window.location = 'index.html';
		} else {
			// cancelled
		}
	});
}

function formFlipCard(friend, mon, day) {
	var zodiacSign = sunsign(mon, day);
	var signSymbol = sunsignSymbol(zodiacSign);
	var uid = friend.uid;

	var sDiv = '<form name="f_'
			+ uid
			+ '" action="/match.jsp" method="post">'
			+ '<div id="flipCard" class="flipCard">'
			+ '<div id="'
			+ uid
			+ '" class="flipFace1">'
			+ '<div class="flipTitle">'
			+ '<img id="friend" align="center" src="'
			+ friend.pic_square
			+ '">'
			+ '<div class="friend_name"><h4 align="center">'
			+ friend.name
			+ '</div></h4>'
			+ '</div>'
			+ '<div class="zodiacsign"><h3 align="center">'
			+ zodiacSign
			+ '</h3></div>'
			+ '<div align="center" title="Flip to see the Zodiac Sign Face"><a class="button orange medium" onclick=flip('+ uid + ')>Flip</a></div>' + '</div>' + '<div class="flipFace2">'
			+ '<div class="flipTitle">'
			+ '<div class="friend_name"><h4 align="center">' + signSymbol
			+ '</div></h4><img src="images/' + zodiacSign + '.jpg'
			+ '"><div class="zodiacsign"><h3 align="center">' + friend.name
			+ '</h3></div>' + '<div align="center">';
	if (dobAvailbleInFacebook) {
		sDiv = sDiv
				+ '<div class="button orange small" title="Click to find the compatibility with this friend">'
				+ '<a title="Affinity Check Pad" href="javascript:submitForm('
				+ uid + ')">Affinity with Me</a></div>';
	}
	sDiv = sDiv
			+ '<a class="button orange small" title="flip back" onclick=flip('
			+ uid + ')>Flip</a></div>' + '</div>'
			+ '</div>' + '</div>'
			+ '<input type="hidden" name="uid1" value="' + me_uid + '">'
			+ '<input type="hidden" name="name1" value="' + me_name + '">'
			+ '<input type="hidden" name="pic1" value="' + me_profile_pic + '">'
			+ '<input type="hidden" name="sign1" value="' + me_sunsign + '">'
			+ '<input type="hidden" name="uid2" value="' + uid + '">'
			+ '<input type="hidden" name="name2" value="' + friend.name + '">'
			+ '<input type="hidden" name="pic2" value="' + friend.pic_square + '">'
			+ '<input type="hidden" name="sign2" value="' + zodiacSign + '">'
			+ '</form>';
	return sDiv;
}

function submitForm(uid) {
	var formid = 'f_' + uid;
	document.forms[formid].submit();
}

function postToNewsFeed() {
	msg = 'Used <img src="http://photos-c.ak.fbcdn.net/photos-ak-snc7/v85006/239/159277490876183/app_2_159277490876183_1954946513.gif"><a href="http://apps.facebook.com/159277490876183/"> Soothsayer</a> to check compatibility with facebook friends.Try <a href="http://apps.facebook.com/159277490876183/"> Soothsayer</a>';

	FB.api('/me/feed', 'post', {
		message : msg
	}, function(response) {
		if (!response || response.error) {
			alert(response.error);
		} else {
			alert('Post ID: ' + response.id);
		}
	});
}

function initProfile() {
	FB
			.api(
					{
						method : 'fql.query',
						query : 'SELECT uid, name,birthday_date,birthday,pic_square FROM user WHERE uid = me()'
					},

					function(data) {
						// do something with the response
						window.me_profile_pic = data[0].pic_square;
						window.me_uid = data[0].uid;
						window.me_name = data[0].name ;
						
						var sDate = data[0].birthday_date;
						if (sDate != null) {
							var bday = sDate.split('/');
							var mon = parseInt(bday[0], 10);
							var day = parseInt(bday[1], 10);
							window.me_sunsign = sunsign(mon, day);
						} else {
							dobAvailbleInFacebook = false;
						}
						
						setProfileHtml('profile');
					});
}

function setProfileHtml(divname) {
	var html = '<img id="me" align="right" src="' + me_profile_pic + '"' + '>';
	html = html + '<p style="font-family:tahoma, verdana, arial, sans-serif;font-size: 16px;position: absolute; left: 0%; top: 95%; ">' + me_sunsign + '</p>';
	document.getElementById('' + divname + '').innerHTML = html;
}

// ////////////////////////
//
// Requests
// See the "Requests" section on https://developers.facebook.com/mobile
//
// ////////////////////////

// Send a request to friends have have logged into the app in the past, as well
// as friends that haven't
function sendRequestBoth() {
	FB
			.ui(
					{
						method : 'apprequests',
						message : 'Try using Affinity to check compatibility between you & your facebook friends',
					}, function(response) {
						console.log('sendRequestBoth response: ', response);
					});
}

// Send an invite to friends that haven't logged into the app yet
function sendRequestInvite() {
	FB
			.ui(
					{
						method : 'apprequests',
						message : 'Try using Affinity to check compatibility between you & your facebook friends',
					}, function(response) {
						console
								.log('sendRequestInvite UI response: ',
										response);
					});
}

// ////////////////////////////////////////////////////

function formUserProfile(uid, divname) {
	FB
			.api(
					{
						method : 'fql.query',
						query : 'SELECT uid, name,birthday_date,birthday,pic_square FROM user WHERE uid = '
								+ uid + ''
					},

					function(data) {
						// do something with the response
						var pic = data[0].pic_square;
						var html = '';// '<img id="me" align="center" src="' +
						// pic + '"' +'>';
						var sDate = data[0].birthday_date;
						me_uid = data[0].uid;

						if (sDate != null) {
							var bday = sDate.split('/');

							var mon = parseInt(bday[0], 10);
							var day = parseInt(bday[1], 10);
							var zodiacSign = sunsign(mon, day);
						}

						html = html + formFaceCard(data[0], mon, day);

						document.getElementById('' + divname + '').innerHTML = html;

					});
}

function formFaceCard(name, pic, sunsign , id) {
	var html = 	  '<div><img id="friend" align="center" src="'+ pic	+ '">'
	+ '<div class="friend_name"><h4 align="center">'+ name+ '</h4></div>'
	+ '<div class="zodiacsign"><h3 align="center">'	+ sunsign + '</h3></div></div>' ;
				
	document.getElementById('' + id + '').innerHTML = html;
}


/////////////////////////////////

//Additional JS functions here
var dobAvailbleInFB = true;
var fb_data;

function populateCombo() {
	// Additional init code here
	FB
			.getLoginStatus(function(response) {
				if (response.status === 'connected') {

					if (!dobAvailbleInFB) {
						alert('Please update your date of birth in facebook.This is needed for compatibility check with your friends.');
					}

					FB
							.api(
									{
										method : 'fql.query',
										query : 'SELECT uid, name,birthday_date,birthday,pic_square FROM user WHERE uid = me() OR uid IN (SELECT uid2 FROM friend WHERE uid1 = me()) order by name'
									},

									function(data) {
										fb_data = data;
										// do something with the response

										var res1 = '<select id="friend1" onchange="chooseFriend1(this)" > <option value="-1">Choose Friend </option>';
										var res2 = '<select id="friend2" onchange="chooseFriend2(this)" > <option value="-1">Choose Friend </option>';

										for ( var i = 0; i < data.length; i++) {
											var sDate = data[i].birthday_date;

											if (sDate != null) {
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
										res1 = res1 + '</select>';
										res2 = res2 + '</select>';

										document
												.getElementById('friends_combo1').innerHTML = res1;
										document
												.getElementById('friends_combo2').innerHTML = res2;

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

function chooseFriend1(sel) {
	var value = sel.options[sel.selectedIndex].value;
	var html = '<img id="pic1" align="center" src="'
			+ fb_data[value].pic_square + '"' + '>';

	html = html + '<input type="hidden" name="uid1" value="'
			+ fb_data[value].uid + '">'
	html = html + '<input type="hidden" name="name1" value="'
			+ fb_data[value].name + '">'
	html = html + '<input type="hidden" name="pic1" value="'
			+ fb_data[value].pic_square + '">'
	html = html + '<input type="hidden" name="sign1" value="'
			+ sunsign2(fb_data[value].birthday_date) + '">'

	document.getElementById('friend_pic1').innerHTML = html;
}

function chooseFriend2(sel2) {
	var value = sel2.options[sel2.selectedIndex].value;
	var html = '<img id="pic2" align="center" src="'
			+ fb_data[value].pic_square + '"' + '>';

	html = html + '<input type="hidden" name="uid2" value="'
			+ fb_data[value].uid + '">'
	html = html + '<input type="hidden" name="name2" value="'
			+ fb_data[value].name + '">'
	html = html + '<input type="hidden" name="pic2" value="'
			+ fb_data[value].pic_square + '">'
	html = html + '<input type="hidden" name="sign2" value="'
			+ sunsign2(fb_data[value].birthday_date) + '">'

	document.getElementById('friend_pic2').innerHTML = html;
}

function validateSubmit() {
	var index1 = document.forms['affinity_check'].friend1.selectedIndex;
	var index2 = document.forms['affinity_check'].friend2.selectedIndex;
	
	if (index1 == index2 || index1 == 0 || index2 == 0) {
		return false;
	} else {
		document.forms['affinity_check'].submit();
		return true;
	}
}