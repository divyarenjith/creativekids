package com.affinity.persistence;

import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.jdo.PersistenceManager;
import javax.jdo.Query;

import com.google.appengine.api.memcache.ErrorHandlers;
import com.google.appengine.api.memcache.MemcacheService;
import com.google.appengine.api.memcache.MemcacheServiceFactory;

public class Utils {

	private static final Logger logger = Logger
			.getLogger(Utils.class.getName());

	public static Object retrieveFromCache(String key) {
		MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
		syncCache.setErrorHandler(ErrorHandlers
				.getConsistentLogAndContinue(Level.INFO));

		return syncCache.get(key);

	}

	public static void addToCache(String key, Object value) {
		MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
		syncCache.setErrorHandler(ErrorHandlers
				.getConsistentLogAndContinue(Level.INFO));

		syncCache.put(key, value);
	}

	public static Object removeFromCache(String key) {
		MemcacheService syncCache = MemcacheServiceFactory.getMemcacheService();
		syncCache.setErrorHandler(ErrorHandlers
				.getConsistentLogAndContinue(Level.INFO));

		return syncCache.delete(key);
	}

	public static Endorsement readEndorsement(String endorsementId) {
		// logger.info("Reading EndorsementVO : " + endorsementId);

		PersistenceManager pm = PMF.get().getPersistenceManager();
		Endorsement endorsement = null;
		try {
			endorsement = pm.getObjectById(Endorsement.class, endorsementId);
			return endorsement;
		} catch (Exception e) {
			logger.info(e.getMessage());
			return null;
		} finally {
			pm.close();
		}
	}

	public static void saveEndorsement(Endorsement endorsement)
			throws Exception {
		// logger.info("Saving endorsement : " +
		// endorsement.getEndorsementId());

		PersistenceManager pm = PMF.get().getPersistenceManager();

		// logger.info("PMF Object created");

		try {
			pm.makePersistent(endorsement); // save the user
		} catch (Exception e) {
			throw e;
		} finally {
			pm.close();
		}
		// Add to the cache
		addToCache(endorsement.getEndorsementId(), "Yes");
	}

	public static boolean hasEndorsement(String friend_uid, String me_uid,
			String character_id, boolean readDataStore) {

		String endorsementId = friend_uid + "_" + me_uid + "_" + character_id;
		logger.info("Checking for id:" + endorsementId );
		Object o = retrieveFromCache(endorsementId);
		if (o != null) {
			if ("Yes".equalsIgnoreCase(o.toString())) {
				logger.info("Endorsement exists in cache." );
				return true;
			}
		}
		logger.info("Cache does not have:" + endorsementId );


		if (readDataStore) {
			logger.info("Reading datastore for id:" + endorsementId );

			Endorsement e = readEndorsement(endorsementId);

			if (e != null) {
				logger.info("Endorsement exists." );
				addToCache(endorsementId, "Yes");
				return true;
			} else {
				logger.info("Endorsement does not exist." );
				return false;
			}
		} else {
			return false;
		}
	}

	public static boolean undoEndorsement(String friend_uid, String me_uid,
			String character_id) {
		String endorsementId = friend_uid + "_" + me_uid + "_" + character_id;
		logger.info("undoEndorsement : " + endorsementId);

		PersistenceManager pm = PMF.get().getPersistenceManager();
		Endorsement endorsement = null;
		try {
			endorsement = pm.getObjectById(Endorsement.class, endorsementId);
			pm.deletePersistent(endorsement);

			addToCache(endorsementId, "No");
			return true;
		} catch (Exception e) {
			logger.info(e.getMessage());
			return false;
		} finally {
			pm.close();
		}
	}

	// Return new endorsements which are not viewed
	public static List<Endorsement> getNewEndorsements(String me_uid) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		List<Endorsement> endorsements = null;
		Query q = null;
		try {
			q = pm.newQuery(Endorsement.class);
			q.setFilter("endorsementForId == endorsementForId && hasViewed == 'false'");
			q.declareParameters("String endorsementForId");
			endorsements = (List<Endorsement>) q.execute(me_uid);
		} catch (Exception e) {
			logger.info(e.getMessage());
			return null;
		} finally {
			pm.close();
			q.closeAll();
		}
		return endorsements;
	}

	// Return all endorsements for a particular uid
	public static List<Endorsement> getAllEndorsementsFrom(String uid) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		List<Endorsement> endorsements = null;
		Query q = null;
		try {
			q = pm.newQuery(Endorsement.class);
			q.setFilter("endorsedById == endorsementByParam");
			logger.info("endorsedById:"+ uid);
			q.declareParameters("String endorsementByParam");
			endorsements = (List<Endorsement>) q.execute(uid);
			endorsements.size();
		} catch (Exception e) {
			logger.info(e.getMessage());
			return null;
		} finally {
			pm.close();
			q.closeAll();
		}
		return endorsements;
	}
	
	public static List<Endorsement> getAllEndorsementsFor(String me_uid) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		List<Endorsement> endorsements = null;
		Query q = null;
		try {
			q = pm.newQuery(Endorsement.class);
			q.setFilter("endorsementForId == endorsementForIdParam");
			logger.info("endorsementFor:"+ me_uid);
			q.declareParameters("String endorsementForIdParam");
			endorsements = (List<Endorsement>) q.execute(me_uid);
			endorsements.size();
		} catch (Exception e) {
			logger.info(e.getMessage());
			return null;
		} finally {
			pm.close();
			q.closeAll();
		}
		return endorsements;
	}


	public static List<Endorsement> getAllFriendEndorsements(String friend_uid,
			String me_uid) {
		PersistenceManager pm = PMF.get().getPersistenceManager();
		List<Endorsement> endorsements = null;
		Query q = null;
		try {
			q = pm.newQuery(Endorsement.class);
			q.setFilter("endorsementFor == endorsementForParam && endorsedById == endorsedByIdParam");
			q.declareParameters("String endorsementForParam, String endorsedByIdParam");

			endorsements = (List<Endorsement>) q.execute(friend_uid, me_uid);
			endorsements.size();
			// logger.info(q.toString());
			// logger.info("FUID;" + friend_uid);
			// logger.info("Me ;" + me_uid);
			// logger.info("Query executed");
			// logger.info("count :" + endorsements.size());
		} catch (Exception e) {
			logger.info(e.getMessage());
			return null;
		} finally {
			pm.close();
			q.closeAll();
		}
		return endorsements;
	}

}
