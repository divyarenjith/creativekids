package com.affinity.controller;

import java.net.URLDecoder;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.affinity.persistence.Endorsement;
import com.affinity.persistence.UserProfile;
import com.affinity.persistence.Utils;
import com.affinity.vo.EndorsementVO;

@Controller
public class AffinityController {
	private static final Logger logger = Logger
			.getLogger(AffinityController.class.getName());

	public static final String FB_APP_SECRET = "cb176e78e74ebfec2b34bfbbc5cd5046";
	public static final String SESSION_EXPIRED = "SESSION_EXPIRED";
	public static final String USER_PROFILE = "USER_PROFILE";

	public static final String ENDORSEMENT_SUCCESS = "ENDORSEMENT_SUCCESS";
	public static final String ENDORSEMENT_FAILURE = "ENDORSEMENT_FAILURE";

	@RequestMapping(value = "/logout", method = RequestMethod.POST)
	public @ResponseBody
	String logout(HttpServletRequest request, ModelMap model) {
		HttpSession session = request.getSession(false);
		if (session == null) {
			// DO NOTHING
		} else {
			session.invalidate();
		}

		return "LOGGED_OUT";
	}

	@RequestMapping(value = "/hello", method = RequestMethod.POST)
	public @ResponseBody
	String hello(HttpServletRequest request, ModelMap model) {
		// logger.info("Inside Say hello");
		HttpSession session = request.getSession(false);
		// logger.info("getting current session.." + session);
		if (session == null) {
			// logger.info("Invalid session.May be coming from IPAD. Lets ask him for the secret.");
			// String secret = request.getParameter("token");
			// Object objProfile = Utils.retrieveFromCache(secret);
			// if (objProfile == null) {
			// logger.warning("SESSION_EXPIRED or someone tried to hack Affinity?");
			// return SESSION_EXPIRED;
			// } else {
			// UserProfile profile = (UserProfile) objProfile;
			// if (profile.getFacebookId() != null) {
			// logger.info("This is a valid user : " +
			// profile.getName());
			// return FB_APP_SECRET;
			// }
			return SESSION_EXPIRED;
			// }
		}

		Object objProfile = session.getAttribute(USER_PROFILE);
		if (objProfile != null) {
			UserProfile profile = (UserProfile) objProfile;
			if (profile.getFacebookId() != null) {
				return FB_APP_SECRET;
			}
		}

		return SESSION_EXPIRED;
	}

	@RequestMapping(value = "/register", method = RequestMethod.POST)
	public @ResponseBody
	String register(HttpServletRequest request, ModelMap model) {
		HttpSession session = request.getSession(true);
		// logger.info("Creating new session");

		session.setAttribute("logged_in", "true");
		// logger.info("marked as logged in");

		UserProfile profile = new UserProfile();

		String me_uid = (String) request.getParameter("me_uid");
		// logger.info("uid:" + me_uid);
		profile.setFacebookId(me_uid);

		String me_name = (String) request.getParameter("me_name");
		// logger.info("me_name:" + me_name);
		profile.setName(me_name);

		//String sessionId = session.getId();
		// Secret key
		//String secret = me_uid + "_" + request.getRemoteAddr() + "_"
		//		+ sessionId + "_" + System.currentTimeMillis();
		// Add profile to memcache
		// Utils.addToCache(secret, profile);
		// Add profile to session
		session.setAttribute(USER_PROFILE, profile);

		return "YOU_LOGGED_IN";
	}

	@RequestMapping(value = "/endorse", method = RequestMethod.POST)
	public @ResponseBody
	String endorse(HttpServletRequest request, ModelMap model) {
		HttpSession session = request.getSession(false);
		UserProfile profile = null;
		if (session == null) {
			// logger.info("Invalid session.May be coming from IPAD. Lets ask him for the secret.");
			// String secret = request.getParameter("token");
			// Object objProfile = Utils.retrieveFromCache(secret) ;
			// if(objProfile == null) {
			// logger.warning("SESSION_EXPIRED or someone tried to hack Affinity?");
			return SESSION_EXPIRED;
			// }
		} else {
			Object objProfile = session.getAttribute(USER_PROFILE);
			if (objProfile != null) {
				profile = (UserProfile) objProfile;
			}
		}

		String endorsedByName = profile.getName();
		String endorsedById = profile.getFacebookId();

		String characterId = (String) request.getParameter("characterId");
		// logger.info("Read character id :" + characterId);

		String friendId = (String) request.getParameter("endorsementFor");
		// logger.info("endorsementFor :" + friendId);

		String endorsementForName = (String) request
				.getParameter("endorsementForName");

		String endorsementId = friendId + "_" + endorsedById + "_"
				+ characterId;
		// logger.info("EndorsementVO id : " + endorsementId);

		Endorsement endorsement = new Endorsement();
		endorsement.setEndorsementId(endorsementId);

		endorsement.setEndorsedById(endorsedById);
		endorsement.setEndorsedByName(URLDecoder.decode(endorsedByName));

		endorsement.setEndorsementForId(friendId);
		endorsement
				.setEndorsementForName(URLDecoder.decode(endorsementForName));

		endorsement.setCharacterId(characterId);
		endorsement.setEndorsementDate(new Date());
		endorsement.setHasViewed("false");

		try {
			// logger.info("Checking if this endorsement exists in datastore.");
			boolean endorsedAlready = Utils.hasEndorsement(friendId,
					profile.getFacebookId(), characterId, true);
			// logger.info("Is already endorsed:" + endorsedAlready);
			if (!endorsedAlready) {
				Utils.saveEndorsement(endorsement);
			}
		} catch (Exception e1) {
			logger.severe(e1.getMessage());
			return ENDORSEMENT_FAILURE;
		}

		return ENDORSEMENT_SUCCESS;
	}

	@RequestMapping(value = "/new_endorsements", method = RequestMethod.POST)
	public @ResponseBody
	String getAllEndorsements(HttpServletRequest request, ModelMap model) {
		HttpSession session = request.getSession(false);
		UserProfile profile = null;
		if (session == null) {
			// logger.info("Invalid session.May be coming from IPAD. Lets ask him for the secret.");
			// String secret = request.getParameter("token");
			// Object objProfile = Utils.retrieveFromCache(secret) ;
			// if(objProfile == null) {
			// logger.warning("SESSION_EXPIRED or someone tried to hack Affinity?");
			return SESSION_EXPIRED;
			// }
		} else {
			Object objProfile = session.getAttribute(USER_PROFILE);
			if (objProfile != null) {
				profile = (UserProfile) objProfile;
			}
		}

		String me_name = profile.getName();
		// logger.info(me_name);
		String me_uid = profile.getFacebookId();
		// logger.info(me_uid);

		List<Endorsement> endorsementsFor = Utils.getAllEndorsementsFor(me_uid);
		// logger.info("read endorsements");
		Map<String, EndorsementVO> traitsMap = new HashMap<String, EndorsementVO>();

		for (Endorsement e : endorsementsFor) {
			String endorsedById = e.getEndorsedById();
			// logger.info("endorsedById :" + endorsedById);
			EndorsementVO vo = traitsMap.get(endorsedById);

			if (vo == null) {
				vo = new EndorsementVO();
				// logger.info("New VO");
				vo.setEndorsementForId(e.getEndorsementForId());
				// logger.info("getEndorsementForId :" +
				// e.getEndorsementForId());
				vo.setEndorsementForName(e.getEndorsementForName());
				// logger.info("getEndorsementForName :"
				// + e.getEndorsementForName());
				vo.setEndorsementFromId(e.getEndorsedById());
				// logger.info("getEndorsedById :" + e.getEndorsedById());
				vo.setEndorsementFromName(e.getEndorsedByName());
				// logger.info("getEndorsedByName :" + e.getEndorsedByName());
				vo.setHasViewed(e.getHasViewed());
				traitsMap.put(endorsedById, vo);
			}
			if (!vo.getTraits().contains(e.getCharacterId())) {
				vo.getTraits().add(e.getCharacterId());
			}

			// logger.info("Adding trait :" + e.getCharacterId());
		}

		Iterator<String> it = traitsMap.keySet().iterator();
		StringBuffer html = new StringBuffer(500);

		html.append("<div id='endorsementsFor'>");
		int counter = 0;
		while (it.hasNext()) {

			String key = it.next();

			EndorsementVO vo = traitsMap.get(key);

			html.append("<div id='endorse_badge_from_"
					+ vo.getEndorsementFromId()
					+ "' class='reveal-modal medium'>");

			html.append("<label id='endorsedById_" + counter
					+ "' style='display:none' >" + vo.getEndorsementFromId()
					+ "</label>");
			html.append("<label id='endorsedByName_" + counter
					+ "' style='display:none'>" + vo.getEndorsementFromName()
					+ "</label>");

			html.append("<label style='color: rgb(116, 48, 64);font-weight: bold;font-family: calibri;'>"
					+ vo.getEndorsementFromName()
					+ " has Badged your following qualities</label>");

			html.append("<div id='traits'>");

			List<String> traits = vo.getTraits();

			for (String trait : traits) {
				html.append("<div style='line-height:30px;color:rgb(184, 127, 9);font-family: calibri;font-size:12px;font-weight:bold;'><img style='float:left;height:30px;' src='/images/endorse.png'><span>"
						+ trait + "</span></div>");
			}
			html.append("</div>");

			html.append("<a id='endorse_badge_close' class='close-reveal-modal'>&#215;</a>");
			html.append("</div>");
			counter++;
		}
		html.append("</div>");

		return html.toString();
	}

	@RequestMapping(value = "/badges_for_friend", method = RequestMethod.POST)
	public @ResponseBody
	String getBadgesForFriend(HttpServletRequest request, ModelMap model) {
		HttpSession session = request.getSession(false);
		UserProfile profile = null;
		if (session == null) {
			// logger.info("Invalid session.May be coming from IPAD. Lets ask him for the secret.");
			String secret = request.getParameter("token");
			Object objProfile = Utils.retrieveFromCache(secret);
			if (objProfile == null) {
				// logger.warning("SESSION_EXPIRED or someone tried to hack Affinity?");
				return SESSION_EXPIRED;
			}
		} else {
			Object objProfile = session.getAttribute(USER_PROFILE);
			if (objProfile != null) {
				profile = (UserProfile) objProfile;
			}
		}

		/*
		 * String me_name = profile.getName(); logger.info(me_name); String
		 * me_uid = profile.getFacebookId(); logger.info(me_uid);
		 */

		String friend_uid = (String) request.getParameter("friend_uid");

		List<Endorsement> endorsementsFor = Utils
				.getAllEndorsementsFor(friend_uid);
		Map<String, Integer> traitsMap = new HashMap<String, Integer>();

		for (Endorsement e : endorsementsFor) {
			String characterId = e.getCharacterId();
			// logger.info("characterId :" + characterId);
			Object objEndorseCnt = traitsMap.get(characterId);

			if (objEndorseCnt != null) {
				Integer intEndorseCnt = (Integer) objEndorseCnt;
				intEndorseCnt++;
			} else {
				traitsMap.put(characterId, new Integer(1));
			}
		}

		Iterator<String> it = traitsMap.keySet().iterator();
		StringBuffer html = new StringBuffer(500);

		html.append("<div id='earned_badges_for_friend'>");
		boolean hasBadges = false;
		while (it.hasNext()) {
			String key = it.next();

			html.append("<div id='badges'>");
			html.append("<div style='line-height:30px;color:#075698;font-family: calibri;font-size:12px;'>");
			html.append("<img style='float:left;height:30px;' src='/images/endorse.png'>");
			html.append("<span>");
			html.append(key + "<span style='color:red'>(" + traitsMap.get(key)
					+ ")</span>");
			html.append("</span>");

			html.append("</div>");

			hasBadges = true;
		}
		if (!hasBadges) {
			html.append("<div id='badges'>");
			html.append("<div style='line-height:30px;color:#075698;font-family: calibri;font-size:12px;font-weight:bold;'>");
			html.append("<img style='float:left;height:30px;' src='/images/endorse.png'>");
			html.append("<span>");
			html.append("<span style='color:red'>0</span> badges so far.You can award a badge by clicking Badge button.");
			html.append("</span>");
		}
		html.append("</div>");

		return html.toString();
	}

	@RequestMapping(value = "/endorsements_from_me", method = RequestMethod.POST)
	public @ResponseBody
	String getEndorsementsFromMe(HttpServletRequest request, ModelMap model) {
		HttpSession session = request.getSession(false);
		UserProfile profile = null;
		if (session == null) {
			// logger.info("Invalid session.May be coming from IPAD. Lets ask him for the secret.");
			// String secret = request.getParameter("token");
			// Object objProfile = Utils.retrieveFromCache(secret) ;
			// if(objProfile == null) {
			// logger.warning("SESSION_EXPIRED or someone tried to hack Affinity?");
			return SESSION_EXPIRED;
			// }
		} else {
			Object objProfile = session.getAttribute(USER_PROFILE);
			if (objProfile != null) {
				profile = (UserProfile) objProfile;
			}
		}

		String me_name = profile.getName();
		// logger.info(me_name);
		String me_uid = profile.getFacebookId();
		// logger.info(me_uid);

		List<Endorsement> endorsementsFrom = Utils
				.getAllEndorsementsFrom(me_uid);
		// logger.info("read endorsements made by me");
		Map<String, EndorsementVO> traitsMap = new HashMap<String, EndorsementVO>();

		for (Endorsement e : endorsementsFrom) {
			String endorsementForId = e.getEndorsementForId();
			// logger.info("endorsedById :" + endorsedById);
			EndorsementVO vo = traitsMap.get(endorsementForId);

			if (vo == null) {
				vo = new EndorsementVO();
				// logger.info("New VO");
				vo.setEndorsementForId(e.getEndorsementForId());
				// logger.info("getEndorsementForId :" +
				// e.getEndorsementForId());
				vo.setEndorsementForName(e.getEndorsementForName());
				// logger.info("getEndorsementForName :"
				// + e.getEndorsementForName());
				vo.setEndorsementFromId(e.getEndorsedById());
				// logger.info("getEndorsedById :" + e.getEndorsedById());
				vo.setEndorsementFromName(e.getEndorsedByName());
				// logger.info("getEndorsedByName :" + e.getEndorsedByName());
				vo.setHasViewed(e.getHasViewed());
				traitsMap.put(endorsementForId, vo);
			}
			if (!vo.getTraits().contains(e.getCharacterId())) {
				vo.getTraits().add(e.getCharacterId());
			}

			// logger.info("Adding trait :" + e.getCharacterId());
		}

		Iterator<String> it = traitsMap.keySet().iterator();
		StringBuffer html = new StringBuffer(500);

		html.append("<div id='endorsements_from_me'>");
		int counter = 0;
		while (it.hasNext()) {
			String key = it.next();

			EndorsementVO vo = traitsMap.get(key);

			html.append("<div id='endorse_badge_for_"
					+ vo.getEndorsementForId() + "'>");

			html.append("<label id='endorsmentForId_" + counter
					+ "' style='display:none' >" + vo.getEndorsementForId()
					+ "</label>");
			html.append("<label id='endorsedForName_" + counter
					+ "' style='display:none'>" + vo.getEndorsementForName()
					+ "</label>");

			html.append("<div id='endorsed_traits_for_"
					+ vo.getEndorsementForId() + "'>");

			List<String> traits = vo.getTraits();

			for (String trait : traits) {
				html.append("<span>" + trait + "</span>");
			}
			html.append("</div>");
			html.append("</div>");
			counter++;
		}
		html.append("</div>");

		return html.toString();
	}
}